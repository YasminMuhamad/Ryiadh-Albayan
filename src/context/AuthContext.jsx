// context/AuthContext.jsx
import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { loginUser as loginService, registerUser as registerService } from "../services/authService";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null); // object from Firebase Auth
  const [profile, setProfile] = useState(null); // object returned from Firestore (contains role)
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);       // role: student/teacher/admin
  const [uid, setUid] = useState(null);         // uid المستخدم

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // جلب البيانات من Firestore عند reload الصفحة
        const uid = user.uid;
        let profile = null;
        let role = null;

        const collectionsToCheck = ["admins", "teachers", "users"];
        for (const col of collectionsToCheck) {
          const docRef = doc(db, col, uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            profile = snap.data();
            role = col === "users" ? (profile.role || "student") : col.slice(0, -1);
            break;
          }
        }

        setFirebaseUser(user);
        setProfile(profile);
        setRole(role);
        setUid(uid);
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setRole(null);
        setUid(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (fullname, email, password, role = "student") => {
    const res = await registerService(fullname, email, password, role);
    setProfile(res);
    setFirebaseUser(auth.currentUser);
    return res;
  };

  // login now discovers role automatically; returns { role, profile, uid }
  const login = async (email, password) => {
    const res = await loginService(email, password); // { uid, role, profile }
    setProfile(res.profile);
    setRole(res.role);
    setUid(res.uid);
    setFirebaseUser(auth.currentUser);
    return res;
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setFirebaseUser(null);
  };

  const value = useMemo(() => ({
    user: firebaseUser,
    profile,
    uid,
    role,
    loading,
    register,
    login,
    logout,
  }), [firebaseUser, profile, uid, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
