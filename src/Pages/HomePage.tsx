import React, { useState } from "react";
import Home from "../Components/Home";
import GameField from "../Components/GameField";
import LogoutButton from "../Components/LogoutButton";

const HomePage: React.FC = () => {
  const [showGame, setShowGame] = useState(false);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      {showGame ? <GameField /> : <Home />}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowGame((prev) => !prev)}
        >
          {showGame ? "Back to Home" : "Go to Gamefield"}
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <LogoutButton />
      </div>
    </div>
  );
};

export default HomePage;
