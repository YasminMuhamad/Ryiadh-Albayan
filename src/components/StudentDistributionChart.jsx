import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase.config";

const COLORS = ["#0E7C7B", "#E9D8A6", "#94A89A", "#D4A574", "#5D8AA8"];

export default function StudentDistributionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore(app);

      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesMap = {};
      categoriesSnapshot.docs.forEach(doc => {
        const cat = doc.data();
        categoriesMap[doc.id] = cat.title || "Unknown";
      });

      const coursesSnapshot = await getDocs(collection(db, "courses"));

      const aggregation = {};
      coursesSnapshot.docs.forEach(doc => {
        const course = doc.data();
        const catName = categoriesMap[course.category] || "Unknown";
        if (!aggregation[catName]) aggregation[catName] = 0;
        aggregation[catName] += course.studentsCount || 0;
      });

      const chartData = Object.entries(aggregation).map(([name, value]) => ({ name, value }));

      console.log("Chart Data:", chartData);
      setData(chartData);
    }

    fetchData();
  }, []);

  const totalStudents = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: totalStudents > 0 ? ((item.value / totalStudents) * 100).toFixed(1) + "%" : "0%",
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={dataWithPercent}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={({ name, percent }) => `${name} (${percent})`}
        >
          {dataWithPercent.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const percent = totalStudents > 0 ? ((value / totalStudents) * 100).toFixed(1) + "%" : "0%";
            return [`${value} students (${percent})`, name];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
