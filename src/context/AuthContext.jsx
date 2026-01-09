import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextDefinition";
import { auth, storage } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split("@")[0],
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      // Force update local state to include the new display name immediately
      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        photoURL: userCredential.user.photoURL,
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const updateUser = async (updates) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updates.name,
          photoURL: updates.avatar,
        });
        setUser((prev) => ({ ...prev, ...updates }));
      } catch (error) {
        console.error("Update profile error:", error);
        throw error;
      }
    }
  };

  const uploadProfilePicture = async (file) => {
    if (!auth.currentUser) return;
    if (!file) {
      // Handle removal (optional logic: reset photoURL)
      // If file is explicitly null, maybe we delete?
      // For now, if no file, just return.
      return;
    }

    try {
      const storageRef = ref(storage, `users/${auth.currentUser.uid}/avatar`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL });

      setUser((prev) => ({
        ...prev,
        photoURL,
      }));

      return photoURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const removeProfilePicture = async () => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { photoURL: "" });
      setUser((prev) => ({ ...prev, photoURL: "" }));
    } catch (error) {
      console.error("Error removing profile picture:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        resetPassword,
        uploadProfilePicture,
        removeProfilePicture,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
