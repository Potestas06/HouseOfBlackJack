// App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";

import Login from "./Components/Login.tsx";
import SignUp from "./Components/SignUp.tsx";
import { auth } from "./Firebase";

const AppRoutes = ({ user }) => {
  const routes = useRoutes([
    {
      path: "/",
      element: user ? <Navigate to="/loggedInSpace" /> : <p>Home screen</p>,
    },
    {
      path: "/login",
      element: user ? <Navigate to="/loggedInSpace" /> : <Login />,
    },
    {
      path: "/signup",
      element: user ? <Navigate to="/loggedInSpace" /> : <SignUp />,
    },
    {
      path: "/loggedInSpace",
      element: user ? <p>U are Now Logged In</p>: <Navigate to="/" />,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ]);

  return routes;
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes user={user} />
    </BrowserRouter>
  );
};

export default App;
