import * as React from "react";

interface ModalProps {
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<ModalProps> = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        minWidth: "350px",
        color: "white",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        border: "1px solid #444",
        fontFamily: "'Roboto', sans-serif",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>{message}</h2>
    </div>
  </div>
);

export default MessageModal;
