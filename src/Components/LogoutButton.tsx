import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/auth"; // Redirect to the auth page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button
      className="btn btn-outline-danger"
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "2px solid #dc3545",
        backgroundColor: "white",
        color: "#dc3545",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#dc3545";
        e.currentTarget.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "white";
        e.currentTarget.style.color = "#dc3545";
      }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;