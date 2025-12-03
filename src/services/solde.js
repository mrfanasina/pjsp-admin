// services/solde.js
import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  getDoc,
  orderBy
} from "firebase/firestore";
import { showToastErr } from "../utils/alerts.js";

/**
 * ------------------------
 * Gestion des documents
 * ------------------------
 */

/**
 * Ajoute un document principal
 * @param {Object} data 
 * @returns {Promise<string>} ID du document créé
 */
export const addDocument = async ({ data }) => {  
  try {
    const docRef = await addDoc(collection(db, "documents"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    // Journaliser l'ajout
    await addDocChange(docRef.id, "addDocument");
    return docRef.id;
  } catch (err) {
    console.error("Erreur addDocument:", err);
    throw err;
  }
};

/**
 * Récupère tous les documents
 */
export const getDocuments = async () => {
  const querySnapshot = await getDocs(collection(db, "documents"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Récupère documents par type
 */
export const getDocumentsByType = async (type) => {
  const q = query(collection(db, "documents"), where("type", "==", type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Met à jour un document existant
 * @param {string} docId
 * @param {Object} data
 */


// 🔧 Fonction utilitaire pour nettoyer tous les undefined, même en profondeur
const cleanUndefined = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }

  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }

  return obj;
};

export const updateDocument = async (docId, data) => {
  try {
    const docRef = doc(db, "documents", docId);

    // Supprimer le champ id et nettoyer les undefined
    const { id, ...payload } = data;
    const cleanPayload = cleanUndefined(payload);

    await updateDoc(docRef, {
      ...cleanPayload,
      updatedAt: serverTimestamp(),
    });

    console.log(`Document ${docId} mis à jour avec succès`);

    // Journaliser la modification
    await addDocChange(docId, "updateDocument");

    return true;
  } catch (err) {
    console.error("Erreur updateDocument:", err);
    throw err;
  }
};


/**
 * Supprime un document
 * @param {string} docId
 */
export const deleteDocument = async (docId) => {
  try {
    await deleteDoc(doc(db, "documents", docId));
    // Journaliser la suppression
    console.log(`Document ${docId} supprimé avec succès`);
    await addDocChange(docId, "deleteDocument");
  } catch (err) {
    console.error("Erreur deleteDocument:", err);
    throw err;
  }
};

/**
 * Supprimer tout les documents d'un type donné
 * @param {string} type
 * @returns {Promise<void>}
 */
export const deleteDocumentsByType = async (type) => {
  try {
    const docs = await getDocumentsByType(type);
    const deletePromises = docs.map((doc) => deleteDocument(doc.id));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error("Erreur deleteDocumentsByType:", err);
    throw err;
  }
};

/**
 * ------------------------
 * Gestion des articles
 * ------------------------
 */
export const addArticle = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "articles"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await addDocChange(docRef.id, "addArticle");
    return docRef.id;
  } catch (err) {
    console.error("Erreur addArticle:", err);
    throw err;
  }
};

export const getArticles = async () => {
  const querySnapshot = await getDocs(collection(db, "articles"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * ------------------------
 * Gestion des services
 * ------------------------
 */
export const addService = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "services"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await addDocChange(docRef.id, "addService");
    return docRef.id;
  } catch (err) {
    console.error("Erreur addService:", err);
    throw err;
  }
};

export const updateService = async (serviceId, data) => {
  try {
    const docRef = doc(db, "services", serviceId);
    const { id, ...payload } = data;
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    await addDocChange(serviceId, "updateService");
    return true;
  } catch (err) {
    console.error("Erreur updateService:", err);
    throw err;
  }
};

export const deleteService = async (serviceId) => {
  try {
    await deleteDoc(doc(db, "services", serviceId));
    await addDocChange(serviceId, "deleteService");
    console.log(`Service ${serviceId} supprimé avec succès`);
  } catch (err) {
    console.error("Erreur deleteService:", err);
    throw err;
  }
};

export const getServices = async () => {
  const querySnapshot = await getDocs(collection(db, "services"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getServiceTypes = async () => {
  const querySnapshot = await getDocs(collection(db, "serviceTypes"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteServiceType = async (serviceTypeId) => {
  try {
    await deleteDoc(doc(db, "serviceTypes", serviceTypeId));
    await addDocChange(serviceTypeId, "deleteServiceType");
    console.log(`ServiceType ${serviceTypeId} supprimé avec succès`);
  } catch (err) {
    console.error("Erreur deleteServiceType:", err);
    throw err;
  }
};

export const updateServiceType = async (serviceTypeId, data) => {
  try {
    const docRef = doc(db, "serviceTypes", serviceTypeId);
    const { id, ...payload } = data;
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    await addDocChange(serviceTypeId, "updateServiceType");
    return true;
  } catch (err) {
    console.error("Erreur updateServiceType:", err);
    throw err;
  }
};

export const addServiceType = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "serviceTypes"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await addDocChange(docRef.id, "addServiceType");
    return docRef.id;
  } catch (err) {
    console.error("Erreur addServiceType:", err);
    throw err;
  }
};

/**
 * ------------------------
 * Gestion des modifications (docChanges)
 * ------------------------
 */

/**
 * Ajoute un événement dans la collection docChanges
 * @param {string} docId - ID du document modifié
 * @param {string} action - "add", "update", "delete"
 */
export const addDocChange = async (docId, action) => {
  try {
    const docRef = await addDoc(collection(db, "docChanges"), {
      docId,
      action,       // "add", "update", "delete"
      timestamp: serverTimestamp(),
    });
    console.log(`docChange ajouté: ${docId} (${action})`);
    return docRef.id;
  } catch (err) {
    console.error("Erreur addDocChange:", err);
    throw err;
  }
};

/**
 * Récupère tous les changements depuis docChanges
 */
export const getDocChanges = async () => {
  const querySnapshot = await getDocs(collection(db, "docChanges"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
/**
 * Récupère tous les documents de type "solde"
 */
export const getSoldeDocuments = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, "documents"), where("type", "==", "solde"))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Récupère tous les documents de type "solde"
 */
export const getPensionsDocuments = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, "documents"), where("type", "==", "pension"))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * ------------------------
 * Gestion des messages
 * ------------------------
 */

// Récupère l'email de réception (settings/appEmail)
export const getReceiverEmail = async (defaultEmail = "service@exemple.com") => {
  try {
    const docRef = doc(db, "settings", "appEmail");
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().receiverEmail) {
      return snap.data().receiverEmail;
    }
    return defaultEmail;
  } catch {
    return defaultEmail;
  }
};

// Met à jour l'email de réception
export const setReceiverEmail = async (email) => {
  await setDoc(doc(db, "settings", "appEmail"), {
    receiverEmail: email,
  });
};

// Récupère tous les messages (triés par date décroissante)
export const getMessages = async () => {
  const q = query(collection(db, "messages"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
    console.log(`Message ${messageId} supprimé`);
  } catch (err) {
    console.error("Erreur deleteMessage:", err);
    throw err;
  }
};


// Compte total
export const countCollection = async (col) => {
    const snap = await getDocs(collection(db, col));
    return snap.size;
};

// Compte documents selon type (solde / pension)
export const countDocumentsByType = async (type) => {
    const q = query(
        collection(db, "documents"),
        where("type", "==", type)
    );
    const snap = await getDocs(q);
    return snap.size;
};

// Derniers documents selon type
export const getLastDocuments = async (type) => {
    const q = query(
        collection(db, "documents"),
        where("type", "==", type),
        orderBy("nature"),
        limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Derniers services
export const getLastServices = async () => {
    const q = query(
        collection(db, "services"),
        orderBy("name"),
        limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Derniers messages
export const getLastMessages = async () => {
    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const testInternetConnection = async () => {
    try {
        const response = await fetch("https://www.google.com", { mode: 'no-cors' });
        console.log("Connexion Internet OK");
        return true;
    } catch (error) {
      // showToastErr("Aucun accèss à internet! Vérifiez votre connexion.");
      return false;
    }
}