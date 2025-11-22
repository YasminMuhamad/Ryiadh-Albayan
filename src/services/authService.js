import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// استخراج الرول من الإيميل
export const getRoleFromEmail = (email) => {
  if (email.includes("student")) return "student";
  if (email.includes("admin")) return "admin";
  return "teacher";
};

// تسجيل مستخدم جديد
export const registerUser = async (fullname, email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const role = getRoleFromEmail(email);

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
      uid: user.uid,
      fullname,
      email,
      role,
      createdAt: serverTimestamp(),
    });

    const savedDoc = await getDoc(userRef);
    return savedDoc.data();
  } catch (error) {
    console.error(" Register Error:", error.code, error.message);
    throw error;
  }
};


// تسجيل دخول
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const savedDoc = await getDoc(userRef);

    return savedDoc.data();
  } catch (error) {
    console.error(" Login Error:", error.code, error.message);
    throw error;
  }
};

// جلب بيانات بروفايل
export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

// تسجيل خروج
export const logoutUser = () => signOut(auth);
