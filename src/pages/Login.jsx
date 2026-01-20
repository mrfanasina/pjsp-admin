import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/PJSP-ico/PJSP2-ico.png";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState("");

  // Vérifie si l'email est dans la collection 'allowedEmails'
  const checkAllowed = async (email) => {
    const docRef = doc(db, "allowedEmails", email.toLowerCase().trim());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  // Logique commune après authentification réussie
  const handleAuthSuccess = async (user) => {
    const allowed = await checkAllowed(user.email);
    
    if (!allowed) {
      await signOut(auth);
      navigate("/non-autorise");
      return;
    }

    setUser(user);
    navigate("/pjsp/dashboard");
  };

  // Connexion via Google
  const connexionGooglePopup = async () => {
    setError("");
    try {
      setLoadingGoogle(true);
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (err) {
      console.error("Erreur Google:", err);
      setError("Échec de la connexion Google. Veuillez réessayer.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Connexion via Email/Password
  const connexionEmail = async (e) => {
    e.preventDefault();
    setError("");
    const email = e.target.email.value;
    const motDePasse = e.target.motDePasse.value;

    try {
      setLoadingEmail(true);
      const result = await signInWithEmailAndPassword(auth, email, motDePasse);
      await handleAuthSuccess(result.user);
    } catch (err) {
      console.error("Erreur Email:", err);
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const isAnyLoading = loadingGoogle || loadingEmail;

  return (
    <div style={styles.page}>
      {/* Injection de l'animation du loader */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.card}>
        <img src={logo} alt="Logo PJSP" style={styles.logo} />
        <h2 style={styles.title}>Espace Connexion</h2>

        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Bouton Google */}
        <button
          style={{
            ...styles.googleBtn,
            opacity: isAnyLoading ? 0.7 : 1,
            cursor: isAnyLoading ? "not-allowed" : "pointer",
          }}
          onClick={connexionGooglePopup}
          disabled={isAnyLoading}
        >
          {loadingGoogle ? (
            <div style={styles.loader}></div>
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={styles.googleLogo}
              />
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>ou</span>
          <span style={styles.dividerLine}></span>
        </div>

        {/* Formulaire Email */}
        <form onSubmit={connexionEmail} style={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="Adresse e-mail"
            style={styles.input}
            required
            disabled={isAnyLoading}
          />
          <input
            name="motDePasse"
            type="password"
            placeholder="Mot de passe"
            style={styles.input}
            required
            disabled={isAnyLoading}
          />

          <button
            type="submit"
            style={{
              ...styles.emailBtn,
              opacity: isAnyLoading ? 0.8 : 1,
              cursor: isAnyLoading ? "not-allowed" : "pointer",
            }}
            disabled={isAnyLoading}
          >
            {loadingEmail ? (
              <div style={styles.loaderWhite}></div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
logo: {
  width: "90px",
  margin: "0 auto 20px auto",
  display: "block",
},

  title: {
    marginBottom: "25px",
    color: "#1a202c",
    fontSize: "24px",
    fontWeight: "700",
  },
  errorBanner: {
    backgroundColor: "#fff5f5",
    color: "#c53030",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid #feb2b2",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    backgroundColor: "#fff",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    width: "100%",
    transition: "all 0.2s ease",
  },
  googleLogo: {
    width: "20px",
    height: "20px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "25px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    padding: "0 15px",
    color: "#a0aec0",
    fontSize: "13px",
    textTransform: "uppercase",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    width: "100%",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  emailBtn: {
    backgroundColor: "#5563DE",
    color: "white",
    border: "none",
    padding: "14px 0",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "10px",
    transition: "background-color 0.2s",
  },
  loader: {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #5563DE",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    animation: "spin 0.8s linear infinite",
  },
  loaderWhite: {
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    margin: "auto",
    animation: "spin 0.8s linear infinite",
  },
};