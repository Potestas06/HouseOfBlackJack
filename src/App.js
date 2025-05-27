import React, { useState, useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";

import AuthPage from "./Pages/AuthPage.tsx";
import ProtectedRoute from "./Components/MiddleWare.tsx";
import HomePage from "./Pages/HomePage.tsx";

import { auth } from "./Firebase";

const AppRoutes = ({ user }) => {
  const routes = useRoutes([
    {
      path: "/auth",
      element: <AuthPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute user={user}>
          <HomePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "*",
      element: (
        <ProtectedRoute user={user}>
          <HomePage />
        </ProtectedRoute>
      ),
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
