import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { loginUser as loginService, registerUser as registerService } from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
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

  const login = async (email, password, role = "student") => {
    const res = await loginService(email, password, role);
    setProfile(res);
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
    loading,
    register,
    login,
    logout,
  }), [firebaseUser, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
