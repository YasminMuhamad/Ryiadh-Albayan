import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "../../firebase.config";
// Reuse the root firebase.config app to avoid duplicate initialization errors
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyD9KLFnZmu4RwsFAgG_BX_psdAFofCOYyE",
  authDomain: "grad-project-b11d3.firebaseapp.com",
  databaseURL: "https://grad-project-b11d3-default-rtdb.firebaseio.com",
  projectId: "grad-project-b11d3",
  storageBucket: "grad-project-b11d3.firebasestorage.app",
  messagingSenderId: "744759817993",
  appId: "1:744759817993:web:191cb4ad7563291eec45d8",
  measurementId: "G-ZVENF1PYSB",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
const messaging = getMessaging(app);

// Request permission & get FCM token
export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BD0x5G8XEvVT85pTjhOeG2qjWsyxgAeXDa969HHgsVMnrM57ZLIukSoZLy5p24DVAaY4_yKcoxQVIFQ9hQJHAWI",
      });
      console.log("Device token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
