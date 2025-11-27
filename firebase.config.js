// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore  } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9KLFnZmu4RwsFAgG_BX_psdAFoCOYyE",
  authDomain: "grad-project-b11d3.firebaseafpp.com",
  projectId: "grad-project-b11d3",
  storageBucket: "grad-project-b11d3.firebasestorage.app",
  messagingSenderId: "744759817993",
  appId: "1:744759817993:web:191cb4ad7563291eec45d8",
  measurementId: "G-ZVENF1PYSB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db, analytics };