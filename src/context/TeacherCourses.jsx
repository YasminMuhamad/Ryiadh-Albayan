import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";

export async function getTeacherCourses(teacherId) {
  const q = query(
    collection(db, "courses"),
    where("teacherId", "==", teacherId)
  );

  const snapshot = await getDocs(q);

  const courses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  return courses;
}
