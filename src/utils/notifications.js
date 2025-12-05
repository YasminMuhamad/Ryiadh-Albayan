import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import * as Notifications from 'expo-notifications';

export const addNotification = async ({ title, message, type = "general", userIds = [] }) => {
  try {
    if (userIds.length === 0) {
      const usersSnap = await getDocs(collection(db, "users"));
      userIds = usersSnap.docs.map(doc => doc.id).filter(Boolean);
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

    // إرسال إشعارات Push
    userIds.forEach(async (userId) => {
      const userDoc = await getDocs(collection(db, 'users'));
      const token = userDoc.docs.find(d => d.id === userId)?.data().expoPushToken;
      if (token) {
        await Notifications.scheduleNotificationAsync({
          content: { title, body: message, data: { type, notificationId } },
          trigger: null,
        });
      }
    });

    console.log('Notification sent:', notificationId);
  } catch (err) {
    console.error(err);
  }
};
