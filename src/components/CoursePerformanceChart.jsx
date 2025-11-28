// src/components/CoursePerformanceChart.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase.config"; // عدلي المسار حسب مكان ملف الكونفيج

export default function CoursePerformanceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore(app);
      const coursesSnapshot = await getDocs(collection(db, "courses"));

      const chartData = coursesSnapshot.docs.map(doc => {
        const course = doc.data();
        return {
          course: course.title || "Unknown",
          completion: course.avgCompletion || 0,
          satisfaction: course.avgSatisfaction || 0,
        };
      });

      console.log("Course Performance Data:", chartData);
      setData(chartData);
    }

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="course"
          tickFormatter={(text) => text.length > 15 ? text.slice(0, 12) + "..." : text}
        />

        <YAxis />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Bar dataKey="completion" name="Completion Rate %" fill="#0E7C7B" />
        <Bar dataKey="satisfaction" name="Satisfaction %" fill="#D4A574" />
      </BarChart>
    </ResponsiveContainer>
  );
}
