// import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.config";

export const addNotification = async ({
  title,
  message,
  type = "general",
  userIds = [],
}) => {
  try {
    if (userIds.length === 0) {
      const usersSnap = await getDocs(collection(db, "users"));
      userIds = usersSnap.docs.map((doc) => doc.id).filter(Boolean);
    }

    const notificationId = `N${Date.now()}`;
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      type,
      userIds,
      read: false,
      createdAt: serverTimestamp(),
      notificationId,
    });
    console.log("Notification sent to:", userIds);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

export const onNotificationsListener = (currentUserId, callback) => {
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((n) => n.userIds.includes(currentUserId));
    callback(notifications);
  });
};

export const markNotificationsAsRead = async (notificationIds) => {
  try {
    const promises = notificationIds.map(async (id) => {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { read: true });
    });
    await Promise.all(promises);
  } catch (err) {
    console.error("Error marking notifications as read:", err);
  }
};
