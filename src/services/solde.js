// services/firebaseService.js
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

/**
 * Ajoute un document avec ses blocs et pièces dans Firestore
 * @param {Object} data 
 * @returns {Promise<string>} ID du document créé
 */
export const addDocument = async ({ data }) => {  
  try {
    console.log("addDocument data:", data);
    // Document principal
    const docRef = await addDoc(collection(db, "documents"), {
      ...data,
      createdAt: serverTimestamp(),
    });
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
 * Supprime un document par son ID
 * @param {string} docId 
 */
export const deleteDocument = async (docId) => {
  try {
    await deleteDoc(doc(db, "documents", docId));
    console.log(`Document ${docId} supprimé avec succès`);
  } catch (err) {
    console.error("Erreur lors de la suppression du document :", err);
    throw err;
  }
};

/**
 * Met à jour un document existant
 * @param {string} docId
 * @param {Object} data
 */
export const updateDocument = async (docId, data) => {
  try {
    const docRef = doc(db, "documents", docId);
    // On n'écrit pas l'ID dans le document lui-même
    const { id, ...payload } = data;
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Erreur updateDocument:", err);
    throw err;
  }
};

/**
 * Ajoute un article pour la référence
 */
export const addArticle = async (data) => {
  try {
    console.log("addArticle data:", data);
    const docRef = await addDoc(collection(db, "articles"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Erreur addArticle:", err);
    throw err;
  }
};

/**
 * Récupère tous les articles
 */
export const getArticles = async () => {
  const querySnapshot = await getDocs(collection(db, "articles"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Ajoute un service
 */ 
export const addService = async (data) => {
  try {
    console.log("addService data:", data);
    const docRef = await addDoc(collection(db, "services"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Erreur addService:", err);
    throw err;
  }
};

/**
 * Modifier un service
 */
export const updateService = async (serviceId, data) => {
  try {
    const docRef = doc(db, "services", serviceId);
    const { id, ...payload } = data;
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Erreur updateService:", err);
    throw err;
  }
};

/**
 * Supprime un service par son ID
 * @param {string} serviceId
 */
export const deleteService = async (serviceId) => {
  try {
    await deleteDoc(doc(db, "services", serviceId));
    console.log(`Service ${serviceId} supprimé avec succès`);
  } catch (err) {
    console.error("Erreur lors de la suppression du service :", err);
    throw err;
  }
};

/**
 * Récupère tous les services
 */
export const getServices = async () => {
  const querySnapshot = await getDocs(collection(db, "services"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};