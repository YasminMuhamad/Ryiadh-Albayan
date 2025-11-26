import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase.config"; // عدلي المسار حسب مشروعك

export default function RevenueTrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchRevenue() {
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "analytics"));
      const chartData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          month: d.yearMonth, // تأكدي إن عندك yearMonth بالشكل "Jan" أو "2025-01"
          revenue: d.revenue || 0,
        };
      });
      setData(chartData);
    }

    fetchRevenue();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E7C7B" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="#0E7C7B" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`USD ${value}`, "Revenue"]} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0E7C7B"
          fill="url(#revenueGradient)"
          strokeWidth={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
