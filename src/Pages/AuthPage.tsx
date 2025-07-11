import React, { useState } from "react";
import SignInWithGoogle from "../Components/GoogleLogin";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>
        {isLogin ? "Sign in" : "Sign up"}
      </h2>
      <p style={{ marginBottom: "24px", color: "#555" }}>Gambling 4 life</p>
      {isLogin ? <SignIn /> : <SignUp />}
      <div style={{ textAlign: "center", margin: "16px 0" }}>or</div>
      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SignInWithGoogle />
      </div>
      <div style={{ textAlign: "center" }}>
        {isLogin ? "don't have an account yet?" : "Already have an account?"}
        <button
          onClick={toggleAuth}
          style={{
            marginLeft: "4px",
            background: "none",
            border: "none",
            color: "#0073b1",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Join now" : "Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
