import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "../../firebase.config";

// Reuse the root firebase.config app to avoid duplicate initialization errors
export const auth = getAuth(app);
export const db = getFirestore(app);
