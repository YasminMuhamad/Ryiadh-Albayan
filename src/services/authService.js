import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { query, collection, where, getDocs } from "firebase/firestore";
// تسجيل مستخدم جديد
export const registerUser = async (fullname, email, password, role = "student") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  const collectionName = role === "teacher" ? "teachers" : "users";

  await setDoc(doc(db, collectionName, res.user.uid), {
    fullname,
    email,
    role,
    createdAt: new Date()
  });

  return { uid: res.user.uid, fullname, email, role };
};

// تسجيل الدخول
export const loginUser = async (email, password, role = "student") => {
  const res = await signInWithEmailAndPassword(auth, email, password);

  if (role === "teacher") {
    const q = query(collection(db, "teachers"), where("email", "==", email));
    const querySnap = await getDocs(q);
    if (querySnap.empty) throw new Error("teacher not found in the database");

    return querySnap.docs[0].data();
  } else {
    const docRef = doc(db, "users", res.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("student not found in the database");
    return docSnap.data();
  }
};