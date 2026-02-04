import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyADEdqlObExEeZH2lGczR0NV9wY6gtQ1MY",
  authDomain: "dashboard-c23c8.firebaseapp.com",
  projectId: "dashboard-c23c8",
  storageBucket: "dashboard-c23c8.firebasestorage.app",
  messagingSenderId: "115815405530",
  appId: "1:115815405530:web:de1a139df2b4ef437752e3",
  measurementId: "G-JVGS6QCJSL",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize the Gemini Developer API backend service
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance with a model that supports text generation
export const geminiModel = getGenerativeModel(ai, {
  model: "gemini-2.0-flash-001",
});
