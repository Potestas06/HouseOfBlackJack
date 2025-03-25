import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Components/Home";
import SignUp from "./Components/SignUp";
import LoggedInComponent from "./Components/LoggedInComponent";
import { auth } from "./Firebase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/loggedInSpace" /> : <Home />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/loggedInSpace" /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/loggedInSpace" /> : <SignUp />}
        />
        <Route
          path="/loggedInSpace"
          element={user ? <LoggedInComponent /> : <Navigate to="/" />}
        />
        <Route
          path="*"
          element={user ? <LoggedInComponent /> : <Navigate to="/" />}
        />
      </Routes>
    </div>
  );
}

export default App;
