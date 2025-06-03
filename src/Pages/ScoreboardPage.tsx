import React from "react";
import Scoreboard from "../Scoreboard.tsx";
import LogoutButton from "../Components/LogoutButton.tsx";

const ScoreboardPage: React.FC = () => {
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
      <Scoreboard />
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <LogoutButton />
      </div>
    </div>
  );
};

export default ScoreboardPage;
