// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9KLFnZmu4RwsFAgG_BX_psdAFoCOYyE",
  authDomain: "grad-project-b11d3.firebaseapp.com",
  projectId: "grad-project-b11d3",
  storageBucket: "grad-project-b11d3.appspot.com",
  messagingSenderId: "744759817993",
  appId: "1:744759817993:web:191cb4ad7563291eec45d8",
  measurementId: "G-ZVENF1PYSB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);      // Firestore
const database = getDatabase(app);  // Realtime Database (لو هتستخدميه)

// Export
export { app, db, database };
