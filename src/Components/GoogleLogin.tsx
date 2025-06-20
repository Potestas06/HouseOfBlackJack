import React, { useState } from "react";
import GoogleButton from "react-google-button";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import MessageModal from "./MessageModal";

const SignInWithGoogle: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowModal(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <GoogleButton onClick={handleGoogleSignIn} />
        {showModal && <MessageModal message="Login successful!" />}
      </div>
    </div>
  );
};

export default SignInWithGoogle;
