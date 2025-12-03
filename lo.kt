package com.fa.pjsp.data.remote.sync

import android.util.Log
import com.fa.pjsp.data.remote.model.FirebaseDocument
import com.fa.pjsp.data.remote.mapper.FirebaseMapper
import com.fa.pjsp.model.database.AppDatabase
import com.fa.pjsp.model.entities.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object FirebaseToRoomSync {

    suspend fun insertFirebaseDocumentToRoom(db: AppDatabase, doc: FirebaseDocument) {
        withContext(Dispatchers.IO) {

            val hierarchy = FirebaseMapper.mapDocumentToRoomHierarchy(doc)

            val natureDao = db.natureDao()
            val titreDao = db.titreDao()
            val sousTitreDao = db.sousTitreDao()
            val pieceDao = db.pieceDao()
            val articleDao = db.articleDao()
            val typeDocumentDao = db.typeDocumentDao()


            // ============================================================
            // 1️⃣ Déterminer type document
            // ============================================================
            val nTypeDocument = when (doc.type.lowercase()) {
                "solde" -> 1
                "pension" -> 2
                else -> 1
            }

            if (typeDocumentDao.getById(nTypeDocument) == null) {
                typeDocumentDao.insert(
                    TypeDocument(n_typedocument = nTypeDocument, activite = doc.type)
                )
            }

            // ============================================================
            // 2️⃣ Gestion Nature
            // ============================================================
            val existingNature = natureDao.getByFirebaseId(doc.id)
            val natureId = existingNature?.n_nature ?: natureDao.insert(
                Nature(
                    libelle_nature = doc.nature,
                    n_typedocument = nTypeDocument,
                    firebaseId = doc.id
                )
            ).toInt()
            
            

            // ============================================================
            // 3️⃣ Nettoyage
            // ============================================================
            titreDao.getByNature(natureId).forEach { t ->
                sousTitreDao.getByTitre(t.n_titre).forEach { st ->
                    pieceDao.deleteBySousTitre(st.n_soustitre)
                }
                sousTitreDao.deleteByTitre(t.n_titre)
            }
            titreDao.deleteByNature(natureId)

            // ============================================================
            // 4️⃣ Articles
            // ============================================================
            doc.reference?.forEach { ref ->
                if (ref.isNotBlank()) {
                    articleDao.upsert(
                        Article(
                            n_article = ref,
                            text_article = ref,
                            id_nature = natureId
                        )
                    )
                }
            }

            // ============================================================
            // 5️⃣ TITRES / SOUS-TITRES / PIÈCES
            // ============================================================
            hierarchy.forEach { mappedTitre ->

                val nTypePiece = mappedTitre.n_piece

                // 🟦 Insérer Titre
                val titreEntity = mappedTitre.titre.copy(
                    n_nature = natureId,
                    n_typepiece = nTypePiece
                )

                val titreId = titreDao.insert(titreEntity).toInt()
                // ============================================================
                // Sous-titres
                // ============================================================
                mappedTitre.sousTitres.forEach { mappedSousTitre ->

                    val sousTitreId = sousTitreDao.insert(
                        mappedSousTitre.sousTitre.copy(n_titre = titreId)
                    ).toInt()

                    // ============================================================
                    // Pièces
                    // ============================================================
                    mappedSousTitre.pieces.forEach { piece ->
                        pieceDao.insert(piece.copy(n_soustitre = sousTitreId))
                    }
                }
            }
        }
    }
}
