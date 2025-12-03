import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../utils/Loader";

// Création du context
const AuthContext = createContext();

// Hook personnalisé pour l’utiliser facilement
export const useAuth = () => useContext(AuthContext);

// Provider global
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Nettoyage de l’abonnement
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};
