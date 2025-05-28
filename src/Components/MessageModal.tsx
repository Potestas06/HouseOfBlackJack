import React from "react";

interface ModalProps {
  message: string;
}

const MessageModal: React.FC<ModalProps> = ({ message }) => (
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
    }}
  >
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "4px",
        textAlign: "center",
        minWidth: "300px",
      }}
    >
      {message}
    </div>
  </div>
);

export default MessageModal;
