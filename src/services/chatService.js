import { db } from "./firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: "AIzaSyAYA0X44TN8X3mNXwkCX2t-mHOC3hJB6bQ", 
  model: "text-embedding-004",
});

export const fetchCourses = async () => {
  const coursesCol = collection(db, "courses");
  const snapshot = await getDocs(coursesCol);
  const courses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return courses;
};

export const prepareCourseEmbeddings = async (courses) => {
  for (const course of courses) {
    if (!course.embedding) {
      const [embedding] = await embeddings.embedDocuments([
        course.title + " " + course.description,
      ]);
      course.embedding = embedding;
    }
  }
  return courses;
};

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
};

export const queryCourse = async (userQuery) => {
  const courses = await fetchCourses();
  await prepareCourseEmbeddings(courses);

  const queryEmbedding = await embeddings.embedQuery(userQuery);

  const results = courses
    .map((course) => ({
      ...course,
      score: cosineSimilarity(course.embedding, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 1); 
  return results.length ? results[0] : null;
};
