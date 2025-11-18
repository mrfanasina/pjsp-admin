import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext"; // <-- contexte global

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // récupération du setter du contexte

  // 🔹 Connexion Google avec Popup
  const connexionGooglePopup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // mise à jour du contexte global
      console.log("Connecté avec Google :", result.user.email);
      navigate("/home");
    } catch (error) {
      console.error("Erreur Google popup :", error);
      alert(error.message);
    }
  };

  // 🔹 Connexion email/mot de passe
  const connexionEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const motDePasse = e.target.motDePasse.value;
    try {
      const result = await signInWithEmailAndPassword(auth, email, motDePasse);
      setUser(result.user); // mise à jour du contexte global
      console.log("Connecté avec email :", result.user.email);
      navigate("/home");
    } catch (erreur) {
      alert("Erreur : " + erreur.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Se connecter</h2>

        <button style={styles.googleBtn} onClick={connexionGooglePopup}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            style={styles.googleLogo}
          />
          <span>Se connecter avec Google</span>
        </button>

        <div style={styles.divider}>ou</div>

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
          <button type="submit" style={styles.emailBtn}>
            Se connecter avec Email
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Styles centrés ---
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e7eaeeff 0%, #d7dbfcff 100%)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px 50px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "350px",
  },
  title: {
    marginBottom: "25px",
    color: "#333",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#fff",
    color: "#444",
    border: "1px solid #ccc",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    width: "100%",
    transition: "all 0.2s ease-in-out",
  },
  googleLogo: {
    width: "22px",
    height: "22px",
  },
  divider: {
    margin: "20px 0",
    color: "#777",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },
  emailBtn: {
    backgroundColor: "#5563DE",
    color: "white",
    border: "none",
    padding: "10px 0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s ease-in-out",
  },
};
