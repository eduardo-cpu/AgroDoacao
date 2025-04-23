import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';

const notificationsCollection = collection(db, 'notifications');

export const notificationService = {
  // Fetch notifications for a specific farm
  async getNotificationsByFarm(farmId) {
    const q = query(notificationsCollection, where('farmId', '==', farmId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    return true;
  }
};

export default notificationService;