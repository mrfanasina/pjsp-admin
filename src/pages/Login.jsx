import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Vérifie si l'email est dans allowedEmails
  const checkAllowed = async (email) => {
    const docRef = doc(db, "allowedEmails", email);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  // Connexion Google
  const connexionGooglePopup = async () => {
    try {
      setLoadingGoogle(true);
      const result = await signInWithPopup(auth, provider);

      const email = result.user.email;
      const allowed = await checkAllowed(email);

      if (!allowed) {
        await auth.signOut();
        navigate("/non-autorise");
        return;
      }

      setUser(result.user);
      navigate("/pjsp/dashboard");

    } catch (error) {
      console.error("Erreur Google popup :", error);
      alert(error.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Connexion Email/Password
  const connexionEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const motDePasse = e.target.motDePasse.value;

    try {
      setLoadingEmail(true);
      const result = await signInWithEmailAndPassword(auth, email, motDePasse);

      const allowed = await checkAllowed(email);
      if (!allowed) {
        await auth.signOut();
        navigate("/non-autorise");
        return;
      }

      setUser(result.user);
      navigate("/pjsp/dashboard");

    } catch (error) {
      console.error(error);
      alert("Erreur : " + error.message);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Se connecter</h2>

        {/* Bouton Google */}
        <button
          style={{
            ...styles.googleBtn,
            opacity: loadingGoogle ? 0.7 : 1,
          }}
          onClick={connexionGooglePopup}
          disabled={loadingGoogle || loadingEmail}
        >
          {loadingGoogle ? (
            <div className="loader" style={styles.loader}></div>
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={styles.googleLogo}
              />
              <span>Se connecter avec Google</span>
            </>
          )}
        </button>

        <div style={styles.divider}>ou</div>

        {/* Formulaire Email */}
        <form onSubmit={connexionEmail} style={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="Adresse e-mail"
            style={styles.input}
            required
          />
          <input
            name="motDePasse"
            type="password"
            placeholder="Mot de passe"
            style={styles.input}
            required
          />

          <button
            type="submit"
            style={styles.emailBtn}
            disabled={loadingEmail || loadingGoogle}
          >
            {loadingEmail ? (
              <div className="loader" style={styles.loaderWhite}></div>
            ) : (
              "Se connecter avec Email"
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
    background: "linear-gradient(120deg, #D7DBEE, #FEFDFF)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
    textAlign: "center",
    width: "380px",
  },
  title: {
    marginBottom: "30px",
    color: "#333",
    fontWeight: 700,
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    backgroundColor: "#fff",
    color: "#444",
    border: "1px solid #ccc",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%",
  },
  googleLogo: {
    width: "24px",
    height: "24px",
  },
  divider: {
    margin: "25px 0",
    color: "#777",
    fontSize: "14px",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%",
    fontSize: "15px",
  },
  emailBtn: {
    backgroundColor: "#5563DE",
    color: "white",
    border: "none",
    padding: "12px 0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
  },

  // Loader noir (Google)
  loader: {
    border: "3px solid #ccc",
    borderTop: "3px solid #444",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    animation: "spin 0.8s linear infinite",
  },

  // Loader blanc (Email)
  loaderWhite: {
    border: "3px solid rgba(255,255,255,0.4)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    margin: "auto",
    animation: "spin 0.8s linear infinite",
  },
};

