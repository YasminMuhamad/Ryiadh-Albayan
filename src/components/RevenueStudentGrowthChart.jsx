// src/components/RevenueStudentGrowthChart.jsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../firebase.config';

export default function RevenueStudentGrowthChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore(app);
      const analyticsSnapshot = await getDocs(collection(db, "analytics"));

      const chartData = analyticsSnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          month: d.yearMonth,
          newStudents: d.newStudents || 0,
          revenue: d.revenue || 0,
        };
      });

      chartData.sort((a, b) => (a.month > b.month ? 1 : -1));

      console.log("Revenue Chart Data:", chartData);
      setData(chartData);
    }

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" orientation="left" stroke="#0E7C7B" />
        <YAxis yAxisId="right" orientation="right" stroke="#E9D8A6" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="newStudents" name="New Students" fill="#0E7C7B" />
        <Bar yAxisId="right" dataKey="revenue" name="Revenue (USD)" fill="#E9D8A6" />
      </BarChart>
    </ResponsiveContainer>
  );
}