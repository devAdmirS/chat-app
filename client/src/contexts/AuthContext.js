import { createContext, useContext, useState, useEffect } from "react";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function register(username, password) {
    return fetch(`/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => data);
  }

  const login = async (username, password) => {
    try {
      const response = await fetch(`/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        localStorage.setItem('token', token);
        setCurrentUser(jwtDecode(token));
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken);
      } catch (error) {
        console.log(error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);
  

  const value = {
    currentUser,
    error,
    setError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
