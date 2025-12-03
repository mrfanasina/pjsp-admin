// importData.js

import fs from 'fs';
import path from 'path';

// Fonctions Firestore
import { 
    addDocument, 
    addArticle, 
    addService, 
    addServiceType 
} from './services/solde.js';

// -------------------------------------------------
// CHEMIN DES FICHIERS JSON
// -------------------------------------------------
const INPUT_DIR = path.resolve('C:/Users/fa/Documents/projet/l3/pjsp-admin/exports_json');

// -------------------------------------------------
//  CHARGEMENT DES JSON
// -------------------------------------------------
const loadAllJsonData = () => {
    console.log(`🔍 Lecture des fichiers JSON dans : ${INPUT_DIR}`);
    const tables = {};
    try {
        const files = fs.readdirSync(INPUT_DIR);

        for (const file of files) {
            if (path.extname(file) === '.json') {
                const tableName = path.basename(file, '.json');
                const filePath = path.join(INPUT_DIR, file);

                const data = fs.readFileSync(filePath, 'utf-8');
                tables[tableName] = JSON.parse(data);

                console.log(`   Chargé : ${tableName}.json (${tables[tableName].length} enregistrements)`);
            }
        }
        return tables;

    } catch (error) {
        console.error("❌ Erreur lors de la lecture des fichiers JSON:", error.message);
        return null;
    }
};

// -------------------------------------------------
//  TRANSFORMATION DES DOCUMENTS (inchangé)
// -------------------------------------------------
const transformDataToFirebaseDocuments = (tables) => {

    const requiredTables = ['Nature', 'titre', 'sous_titre', 'piece', 'article', 'typepiece', 'typedocument'];
    if (requiredTables.some(t => !tables[t])) {
        console.error("❌ Tables manquantes.");
        return [];
    }

    console.log("\n🔄 Transformation des documents...");

    const naturesMap = new Map(tables.Nature.map(n => [n.n_nature, n]));
    const typesDocsMap = new Map(tables.typedocument.map(td => [td.n_typedocument, td.activite]));
    const typesPiecesMap = new Map(tables.typepiece.map(tp => [tp.n_typepiece, tp.type_piece]));

    const articlesByNature = new Map();
    tables.article.forEach(a => {
        const key = a.id_nature;
        if (!articlesByNature.has(key)) articlesByNature.set(key, []);
        articlesByNature.get(key).push(a.text_article);
    });

    const titresByNature = new Map();
    tables.titre.forEach(t => {
        const key = t.n_nature;
        if (!titresByNature.has(key)) titresByNature.set(key, []);
        titresByNature.get(key).push(t);
    });

    const sousTitresByTitre = new Map();
    tables.sous_titre.forEach(st => {
        const key = st.n_titre;
        if (!sousTitresByTitre.has(key)) sousTitresByTitre.set(key, []);
        sousTitresByTitre.get(key).push(st);
    });

    const piecesBySousTitre = new Map();
    tables.piece.forEach(p => {
        const key = p.n_soustitre;
        if (!piecesBySousTitre.has(key)) piecesBySousTitre.set(key, []);
        piecesBySousTitre.get(key).push(p.piece);
    });

    const firebaseDocuments = [];

    for (const natureRow of tables.Nature) {

        const nNature = natureRow.n_nature;

        const document = {
            nature: natureRow.libelle_nature || null,
            type: typesDocsMap.get(natureRow.n_typedocument) || 'inconnu',
            reference: articlesByNature.get(nNature) || [],
            titres: []
        };

        const relatedTitres = titresByNature.get(nNature) || [];

        document.titres = relatedTitres.map(titreRow => {
            const nTitre = titreRow.n_titre;

            return {
                titre: titreRow.titre,
                pieceType: typesPiecesMap.get(titreRow.n_typepiece) || null,
                sousTitres: (sousTitresByTitre.get(nTitre) || []).map(st => ({
                    sousTitre: st.sous_titre,
                    pieces: piecesBySousTitre.get(st.n_soustitre) || []
                }))
            };
        });

        firebaseDocuments.push(document);
    }

    return firebaseDocuments;
};

// -------------------------------------------------
//  IMPORT DOCUMENTS
// -------------------------------------------------
const importDocuments = async (tables) => {
    const documentsToImport = transformDataToFirebaseDocuments(tables);

    if (!documentsToImport.length) return;

    console.log(`\n🚀 Importation de ${documentsToImport.length} documents...`);

    let success = 0;
    let fail = 0;

    for (const docData of documentsToImport) {
        try {
            await addDocument({ data: docData });
            success++;
        } catch (err) {
            console.error("❌ Erreur document :", err.message);
            fail++;
        }
    }

    console.log(`🎉 Succès : ${success} | ❌ Erreurs : ${fail}`);
};

// -------------------------------------------------
//  IMPORT SERVICES + CREATION DES TYPES PAR DEFAUT
// -------------------------------------------------

/**
 * Crée 3 types par défaut et retourne un map :
 * {
 *   1 : "id Firestore type 1",
 *   2 : "id Firestore type 2",
 *   3 : "id Firestore type 3"
 * }
 */
const createDefaultServiceTypes = async () => {

    console.log("\n🛠 Création des 3 types par défaut...");

    const DEFAULT_TYPES = [
        { num: 1, label: "Service Regional de la solde et des pensions" },
        { num: 2, label: "Antenne de la Solde et des Pensions" },
        { num: 3, label: "Service Central de la Solde et des Pensions" }
    ];

    const typeMap = {};

    for (const t of DEFAULT_TYPES) {
        const id = await addServiceType({ label: t.label });
        typeMap[t.num] = id;  
        console.log(`   ➕ Type créé : ${t.label} (Firestore ID = ${id})`);
    }

    return typeMap;
};

const importServices = async (tables) => {
    if (!tables.service) {
        console.log("⚠️ Table 'service' absente.");
        return;
    }

    const services = tables.service;

    console.log(`\n🚀 Importation de ${services.length} services...`);

    // 1️⃣ Création des types par défaut
    const typeMap = await createDefaultServiceTypes();

    let success = 0;
    let fail = 0;

    for (const row of services) {
        try {
            const { n_service, nom_service, telephone, type } = row;

            if (!typeMap[type]) {
                console.error(`⚠️ Type SQL inconnu : ${type}. Service ignoré.`);
                continue;
            }

            const payload = {
                name: nom_service || "",
                telephone: telephone || "",
                type: typeMap[type]   // 🔥 MAP FIRESTORE ID
            };

            await addService(payload);
            success++;

        } catch (err) {
            fail++;
            console.error(`❌ Erreur service : ${row.nom_service}`, err.message);
        }
    }

    console.log(`🎉 Succès : ${success} | ❌ Erreurs : ${fail}`);
};

// -------------------------------------------------
//  MAIN
// -------------------------------------------------
const mainImport = async () => {
    console.log("===============================================");
    console.log("      DÉMARRAGE MIGRATION FIREBASE");
    console.log("===============================================");

    const tables = loadAllJsonData();
    if (!tables) return;

    await importDocuments(tables);
    await importServices(tables);

    console.log("\n🎉 Migration terminée !");
    console.log("===============================================");
};

mainImport();
