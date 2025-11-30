import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { query, collection, where, getDocs } from "firebase/firestore";
// تسجيل مستخدم جديد
export const registerUser = async (fullname, email, password, role = "student") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  const collectionName = "users";

  await setDoc(doc(db, collectionName, res.user.uid), {
    name: fullname,
    name_ar: "",
    email,
    profile_pic: "",
    role: "student",
    subscriptionStatus: "Inactive",
    createdAt: new Date(),
    coursesCount: 0
  });

  return { uid: res.user.uid, fullname, email, role };
};

// // تسجيل الدخول
// export const loginUser = async (email, password, role = "student") => {
//   const res = await signInWithEmailAndPassword(auth, email, password);

//   if (role === "teacher") {
//     const q = query(collection(db, "teachers"), where("email", "==", email));
//     const querySnap = await getDocs(q);
//     if (querySnap.empty) throw new Error("teacher not found in the database");

//     return querySnap.docs[0].data();
//   } else {
//     const docRef = doc(db, "users", res.user.uid);
//     const docSnap = await getDoc(docRef);
//     if (!docSnap.exists()) throw new Error("student not found in the database");
//     return docSnap.data();
//   }
// };
/**
 * loginUser - يعمل signIn ثم يكتشف الرول تلقائيًا:
 *  - يحاول يلاقي doc بالـ UID في كل كوليكشن بالأولوية (admins -> teachers -> users)
 *  - لو مفيش doc بالـ UID، يعمل fallback بالـ email (query)
 *  - يرجع { role, profile, uid }
 */
export const loginUser = async (email, password) => {
  // 1) sign in with Firebase Auth
  const res = await signInWithEmailAndPassword(auth, email, password);
  const uid = res.user.uid;
  const normalizedEmail = String(email).trim().toLowerCase();

  const tryGetByUid = async (collectionName) => {
    const ref = doc(db, collectionName, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, data: snap.data() } : null;
  };

  const tryQueryByEmail = async (collectionName) => {
    const q = query(collection(db, collectionName), where("email", "==", normalizedEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, data: d.data() };
    }
    return null;
  };

  // ترتيب الافضلية — عدّليه لو عايزة (مثلاً teachers أسبق من admins)
  const collectionsToCheck = ["admins", "teachers", "users"];

  for (const col of collectionsToCheck) {
    // try by UID first
    const byUid = await tryGetByUid(col);
    if (byUid) {
      const role = col === "users" ? (byUid.data.role || "student") : col.slice(0, -1);
      return { role, profile: byUid.data, uid };
    }
    // fallback: try by email
    const byEmail = await tryQueryByEmail(col);
    if (byEmail) {
      const role = col === "users" ? (byEmail.data.role || "student") : col.slice(0, -1);
      return { role, profile: byEmail.data, uid };
    }
  }

  // لو مش موجود في أي كوليكشن
  throw new Error("User authenticated but no role/profile found in Firestore.");
};