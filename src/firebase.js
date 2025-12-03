// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzPNjIKir78VlIFYx5VcYwk-vD7cJAaX8",
  authDomain: "pjsp-12073.firebaseapp.com",
  projectId: "pjsp-12073",
  storageBucket: "pjsp-12073.firebasestorage.app",
  messagingSenderId: "282566847757",
  appId: "1:282566847757:web:48376e81a6cfce6bf4d444",
  measurementId: "G-RZHJL7TVG6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);