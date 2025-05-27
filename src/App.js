// App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";

import AuthPage from "./Pages/AuthPage.tsx";
import ProtectedRoute from "./Components/MiddleWare.tsx";
import HomePage from "./Pages/HomePage.tsx";

import { auth } from "./Firebase";

const AppRoutes = ({ user }) => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Navigate to={user ? "/loggedInSpace" : "/auth"} />,
    },
    {
      path: "/auth",
      element: user ? <Navigate to="/loggedInSpace" /> : <AuthPage />,
    },
    {
      path: "/loggedInSpace",
      element: (
        <ProtectedRoute user={user}>
          <HomePage />
        </ProtectedRoute>
      ),
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
