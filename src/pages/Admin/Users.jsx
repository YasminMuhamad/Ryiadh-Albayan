import React, { useEffect } from "react";
import Title from "../../components/Title";
import SearchBar from "../../components/SearchBar";
import { collection, doc, onSnapshot, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { Button } from '../../components/Button';
import { UserCheck, UserX } from 'lucide-react';
import Toast from '../../components/Toast';

export default function AdminUsers() {
  const [users, setUsers] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [toast, setToast] = React.useState({ message: "", type: "", show: false });
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), async (snap) => {
      const list = await Promise.all(snap.docs.map(async (docSnap) => {
        const userData = { id: docSnap.id, ...docSnap.data() };
        const enrollSnap = await getDocs(collection(db, "users", docSnap.id, "enrollments"));
        userData.coursesCount = enrollSnap.size;
        let totalPercent = 0;
        enrollSnap.forEach(e => totalPercent += e.data().percent || 0);
        userData.progress = enrollSnap.size > 0 ? Math.round(totalPercent / enrollSnap.size) : 0;
        return userData;
      }));
      setUsers(list);
    });
    return () => unsubscribe();
  }, []);

  const onButtonClick = async (action, userId) => {
    try {
      const userRef = doc(db, "users", userId);
      if (action === "activate") {
        await updateDoc(userRef, { subscriptionStatus: "Active" });
        setToast({ message: "User activated", type: "success", show: true });
      } else if (action === "deactivate") {
        await updateDoc(userRef, { subscriptionStatus: "Inactive" });
        setToast({ message: "User deactivated", type: "success", show: true });
      }
    } catch (err) {
      console.error("Failed to update user subscriptionStatus:", err);
      setToast({ message: "Failed to update user", type: "error", show: true });
    }
  };


  const filteredUsers = users.filter(
    u =>
      (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (u.name_ar || "").toLowerCase().includes(query.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="flex items-center justify-between mb-4"></div>
      <Title enTitle="User Management" arTitle="إدارة المستخدمين" />
      <SearchBar
        placeholder="Search users by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <table className="min-w-full divide-y divide-gray-200 mt-6 border border-rounded-xlg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">subscriptionStatus</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="p-2 whitespace-nowrap">{user.name}</td>
              <td className="p-2 whitespace-nowrap">{user.name_ar}</td>
              <td className="p-2 whitespace-nowrap">{user.email}</td>
              <td className="p-2 whitespace-nowrap">{user.coursesCount || 0}</td>
              <td className="p-2 whitespace-nowrap flex"><div className="w-32 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-700 h-3 rounded-full"
                  style={{ width: `${user.progress || 0}%` }}
                ></div>
              </div>
                <span className="ml-2 text-xs font-medium">{user.progress || 0}%</span></td>
              <td className="p-2 whitespace-nowrap">
                <span
                  className={`rounded-2xl px-3 py-1 text-xs ${user.subscriptionStatus === "Active"
                    ? "bg-[#E2ECE7] text-[#0E7C7B]"
                    : "bg-[#F5F3ED] text-gray-500"
                    }`}
                >
                  {user.subscriptionStatus || "Inactive"}
                </span>
              </td>
              <td className="p-2 whitespace-nowrap flex gap-2">
                <Button key="activate" className="btn-primary" icon={UserCheck} title="Activate" onClick={() => onButtonClick('activate', user.id)} />
                <Button key="deactivate" className="btn-secondary" icon={UserX} title="Deactivate" onClick={() => onButtonClick('deactivate', user.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}