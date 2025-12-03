import React from "react";
import "../assets/css/LoadingSpinner.css"; 

const LoadingSpinner = () => {
  const bars = Array.from({ length: 4 });

  return (
    <div className="spinner-container">
      <div className="bars">
        {bars.map((_, idx) => (
          <div key={idx} className="bar" style={{ animationDelay: `${idx * 0.1}s` }}></div>
        ))}
      </div>
      <p>Chargement...</p>
    </div>
  );
};

export default LoadingSpinner;
