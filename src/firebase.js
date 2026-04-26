
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0Zc4kTyAQUOaibdaMoIWiXzxoNTWhzls",
  authDomain: "reccurex.firebaseapp.com",
  projectId: "reccurex",
  storageBucket: "reccurex.firebasestorage.app",
  messagingSenderId: "181705047758",
  appId: "1:181705047758:web:7889ec39d4995ed3709a9f",
  measurementId: "G-81W42TKVWK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the tools so other files can use them
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;