import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  loginUser as loginService,
  registerUser as registerService,
} from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);

      if (!u) {
        setFirebaseUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(u);

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile({
            uid: u.uid,
            fullname: "",
            email: u.email,
            role: "student",
          });
        }
      } catch (e) {
        console.warn("AuthContext: error loading profile:", e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const register = async (fullname, email, password) => {
    const res = await registerService(fullname, email, password);
    setProfile(res);
    return res;
  };

  const login = async (email, password) => {
    const res = await loginService(email, password);
    setProfile(res);
    setFirebaseUser(auth.currentUser);
    return res;
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      loading,
      register,
      login,
      logout,
    }),
    [firebaseUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
