import React, { useState } from "react";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Don't store password in session
      const { password: _, ...userSafe } = foundUser;
      setUser(userSafe);
      localStorage.setItem("user", JSON.stringify(userSafe));
      return true;
    }
    return false;
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.email === email)) {
      return false; // User already exists
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, hash this!
      avatar: null,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Auto login
    const { password: _, ...userSafe } = newUser;
    setUser(userSafe);
    localStorage.setItem("user", JSON.stringify(userSafe));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
