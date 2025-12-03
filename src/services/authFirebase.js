// services/authFirebase.js
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, deleteUser } from "firebase/auth";
import { getFirestore, doc, setDoc, deleteDoc, getDoc, collection, getDocs } from "firebase/firestore";
import {app} from "../firebase"; // ton fichier firebase.js avec initializeApp

const auth = getAuth(app);
const db = getFirestore(app);

const USERS_COLLECTION = "allowedEmails";

/**
 * Ajoute un email autorisé pour Google
 */
export async function addGoogleEmail(email) {
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    throw new Error("Email invalide");
  }

  // Vérifier si déjà existant dans Firestore
  const docRef = doc(db, USERS_COLLECTION, email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    throw new Error("Email déjà autorisé");
  }

  // Ajouter à Firestore
  await setDoc(docRef, { method: "google", email });
  return { email, method: "google" };
}

/**
 * Ajoute un compte Email+Password
 */
export async function addEmailPassword(email, password) {
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    throw new Error("Email invalide");
  }

  // Vérifier si compte déjà existant dans Auth
  const methods = await fetchSignInMethodsForEmail(auth, email);
  if (methods.length > 0) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  // Créer compte Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Ajouter à Firestore pour liste autorisée
  const docRef = doc(db, USERS_COLLECTION, email);
  await setDoc(docRef, { method: "email", email });

  return { email, method: "email", uid: userCredential.user.uid };
}

/**
 * Supprimer un utilisateur autorisé
 */
export async function deleteUserEmail(email) {
  // Supprimer Firestore
  const docRef = doc(db, USERS_COLLECTION, email);
  await deleteDoc(docRef);

  // Supprimer Auth si compte Email+Password
  const methods = await fetchSignInMethodsForEmail(auth, email);
  if (methods.includes("password")) {
    // Nécessite que l'utilisateur soit connecté ou via Admin SDK
    // Ici on ne peut pas supprimer un user Auth côté client pour un autre utilisateur
    // Tu devrais utiliser Firebase Admin SDK côté serveur pour supprimer
    console.warn("Suppression Auth côté client impossible pour un autre utilisateur");
  }

  return true;
}

/**
 * Récupérer tous les utilisateurs autorisés
 */
export async function getAllowedUsers() {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  const users = [];
  querySnapshot.forEach((doc) => users.push(doc.data()));
  return users;
}
