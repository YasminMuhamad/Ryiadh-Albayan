import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9KLFnZmu4RwsFAgG_BX_psdAFofCOYyE",
  authDomain: "grad-project-b11d3.firebaseapp.com",
  databaseURL: "https://grad-project-b11d3-default-rtdb.firebaseio.com",
  projectId: "grad-project-b11d3",
  storageBucket: "grad-project-b11d3.firebasestorage.app",
  messagingSenderId: "744759817993",
  appId: "1:744759817993:web:191cb4ad7563291eec45d8",
  measurementId: "G-ZVENF1PYSB"
};

// initialize
const app = initializeApp(firebaseConfig);

// services
export const auth = getAuth(app);
export const db = getFirestore(app);
