import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { DollarSign, TrendingUp, Users, BarChart2 } from "lucide-react";
import RevenueKPI from "../../components/RevenueKPI";
import RevenueTrendChart from "../../components/RevenueTrendCard";
import CategoryListCard from "../../components/CategoryListCard";
import TopPerformingCard from "../../components/TopPerformingCard";
import { DashCard } from "../../components/DashCard";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../../firebase.config";

const COLORS = ["#0E7C7B", "#E9D8A6", "#94A89A", "#D4A574", "#5D8AA8"];

export default function AdminRevenue() {
  const [kpis, setKpis] = useState({});
  const [categoryItems, setCategoryItems] = useState([]);
  const [topCourses, setTopCourses] = useState([]);

  useEffect(() => {
    async function fetchRevenueData() {
      const db = getFirestore(app);

      // users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => doc.data());
      const activeStudents = users.filter(u => u.subscriptionStatus === "Active").length;

      // courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const courses = coursesSnapshot.docs.map(doc => doc.data());

      // Total Revenue
      const totalRevenue = courses.reduce((sum, c) => sum + (c.revenueTotal || 0), 0);

      // Monthly growth
      const analyticsSnapshot = await getDocs(collection(db, "analytics"));
      const monthly = analyticsSnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => new Date(a.yearMonth + "-01") - new Date(b.yearMonth + "-01")); // ترتيب حسب الشهر

      let monthlyGrowth = 0;
      if (monthly.length >= 2) {
        const lastMonth = monthly[monthly.length - 1].revenue || 0;
        const prevMonth = monthly[monthly.length - 2].revenue || 1;
        monthlyGrowth = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);
      }


      // Avg per student
      const avgPerStudent = activeStudents ? (totalRevenue / activeStudents).toFixed(2) : 0;

      setKpis({
        totalRevenue,
        monthlyGrowth,
        activeStudents,
        avgPerStudent
      });

      // Category Revenue
      const categoryRevenue = {};
      courses.forEach(c => {
        if (c.category) {
          categoryRevenue[c.category] = (categoryRevenue[c.category] || 0) + (c.revenueTotal || 0);
        }
      });
      setCategoryItems(Object.entries(categoryRevenue).map(([name, value], i) => ({
        name,
        value: `USD ${value.toLocaleString()}`,
        color: COLORS[i % COLORS.length]
      })));

      // Top Courses
      setTopCourses(
        courses
          .sort((a, b) => (b.revenueTotal || 0) - (a.revenueTotal || 0))
          .slice(0, 4)
          .map(c => ({ name: c.title, value: c.revenueTotal || 0 }))
      );
    }

    fetchRevenueData();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <Title className="text-lg" enTitle="Revenue Management" arTitle="إدارة الإيرادات" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-4">
        <RevenueKPI value={`USD ${kpis.totalRevenue?.toLocaleString()}`} title="Total Revenue" subtitle="إجمالي الإيرادات" Icon={DollarSign} />
        <RevenueKPI value={`${kpis.monthlyGrowth >= 0 ? '+' : ''}${kpis.monthlyGrowth}%`} title="Monthly Growth" subtitle="النمو الشهري" Icon={TrendingUp} />
        <RevenueKPI value={kpis.activeStudents} title="Active Subscriptions" subtitle="الاشتراكات النشطة" Icon={Users} />
        <RevenueKPI value={`USD ${kpis.avgPerStudent}`} title="Avg. Per Student" subtitle="متوسط الربح لكل طالب" Icon={BarChart2} />
      </div>

      <DashCard title={'Revenue Trend'} subtitle={'اتجاه الإيرادات'} className="mt-6 w-full">
        <RevenueTrendChart />
      </DashCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashCard className="h-[250px]" title={'Revenue by Course Category'} subtitle={'الإيرادات حسب فئة الكورس'}>
          <CategoryListCard items={categoryItems} />
        </DashCard>
        <DashCard className="h-[250px]" title={'Top Performing Courses'} subtitle={'أفضل الكورسات أداءً'}>
          <TopPerformingCard courses={topCourses} totalRevenue={kpis.totalRevenue} />
        </DashCard>
      </div>
    </div>
  );
}
