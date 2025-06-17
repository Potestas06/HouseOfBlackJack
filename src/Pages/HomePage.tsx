import { useState } from "react";
import GameField from "./GameField.tsx";
import Home from "../Components/Home.tsx";
import LogoutButton from "../Components/LogoutButton.tsx";

const HomePage: React.FC = () => {
  const [showGame, setShowGame] = useState(false);

  return (
      <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundImage: showGame ? `url('/teppich.png')` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
            position: "relative",
          }}
      >
        {showGame ? <GameField /> : <Home />}
        <div style={{ textAlign: "center", marginTop: "24px", position: "absolute", bottom: 80, left: 0, right: 0 }}>
          <button
              className="btn btn-secondary"
              onClick={() => setShowGame((prev) => !prev)}
          >
            {showGame ? "Back to Home" : "Go to Gamefield"}
          </button>
        </div>
        <div style={{ textAlign: "center", position: "absolute", bottom: 20, left: 0, right: 0 }}>
          <LogoutButton />
        </div>
      </div>
  );
};

export default HomePage;
