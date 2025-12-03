import React from "react";
import { useNavigate } from "react-router-dom";
import BlockIcon from "@mui/icons-material/Block"; // Icône Material UI
import { Warning } from "@mui/icons-material";

export default function NonAutorise() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <Warning   style={styles.icon} />
        </div>
        <h1 style={styles.title}>Accès refusé</h1>
        <p style={styles.text}>
          Votre adresse e-mail n'est pas autorisée à accéder à cette application.
        </p>
        <button
          style={styles.button}
          onClick={() => navigate("/")}
          onMouseOver={(e) => (e.currentTarget.style.background = "#A1D3F5FF")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          Retour à la page de connexion
        </button>
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #CADEEEFF 0%, #DEE4F0FF 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#fff",
    padding: "20px",
    animation: "fadeInBg 1s",
  },
  card: {
    background: "#CBEFF188",
    padding: "48px 36px 36px 36px",
    borderRadius: "24px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
    backdropFilter: "blur(54px)",
    position: "relative",
    animation: "fadeInCard 0.8s",
  },
  iconWrapper: {
    background: "linear-gradient(135deg, #CC8787FF 60%, #D44961FF 100%)",
    borderRadius: "50%",
    width: "70px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px auto",
    boxShadow: "0 4px 16px rgba(249,83,198,0.18)",
    border: "1px solid #CF56B5FF",
    animation: "popIn 0.7s",
  },
  icon: {
    fontSize: "38px",
    color: "#B91D1DFF",
    filter: "drop-shadow(0 2px 8px #B33B8BAA)",
  },
  title: {
    fontSize: "30px",
    marginBottom: "16px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "#46130CFF",
    textShadow: "0 2px 8px #B91D1DAA",
  },
  text: {
    fontSize: "17px",
    marginBottom: "32px",
    color: "#070820FF",
    opacity: 0.93,
    lineHeight: 1.6,
  },
  button: {
    backgroundColor: "#fff",
    color: "#1D88B9FF",
    border: "none",
    padding: "13px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: 600,
    boxShadow: "0 2px 8px #b91d7333",
    transition: "all 0.2s",
    outline: "none",
  },
};

// Optionnel : animations CSS globales à ajouter dans ton CSS principal
/*
@keyframes fadeInBg {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInCard {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes popIn {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
*/
