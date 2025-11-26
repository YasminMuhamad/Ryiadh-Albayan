// src/pages/Admin/Analytics.jsx
import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import StudentDistributionChart from '../../components/StudentDistributionChart';
import { DashCard } from '../../components/DashCard';
import RevenueStudentGrowthChart from '../../components/RevenueStudentGrowthChart';
import CoursePerformanceChart from '../../components/CoursePerformanceChart';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../../firebase.config";

export default function AdminAnalytics() {
  const [avgCompletion, setAvgCompletion] = useState(0);
  const [avgSatisfaction, setAvgSatisfaction] = useState(0);
  const [activeRate, setActiveRate] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);

  useEffect(() => {
    async function fetchKPIs() {
      const db = getFirestore(app);

      // الكورسات
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const courses = coursesSnapshot.docs.map(doc => doc.data());
      const totalCourses = courses.length;
      const totalCompletion = courses.reduce((sum, c) => sum + (c.avgCompletion || 0), 0);
      const totalSatisfaction = courses.reduce((sum, c) => sum + (c.avgSatisfaction || 0), 0);

      setAvgCompletion(totalCourses ? (totalCompletion / totalCourses).toFixed(1) : 0);
      setAvgSatisfaction(totalCourses ? (totalSatisfaction / totalCourses).toFixed(1) : 0);

      // الطلاب
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => doc.data());
      const activeStudents = users.filter(u => u.subscriptionStatus === "Active").length;
      console.log("Active Students:", activeStudents);
      setActiveRate(users.length ? ((activeStudents / users.length) * 100).toFixed(1) : 0);

      // analytics
      const analyticsSnapshot = await getDocs(collection(db, "analytics"));
      const monthly = analyticsSnapshot.docs.map(doc => doc.data());
      if (monthly.length >= 2) {
        const lastMonth = monthly[monthly.length - 1].revenue;
        const prevMonth = monthly[monthly.length - 2].revenue;
        setMonthlyGrowth(prevMonth ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : 0);
      }
    }

    fetchKPIs();
  }, []);

  return (
    <div>
      <Title enTitle="Analytics Dashboard" arTitle="لوحة تحليلات الإدارة" />
      {/* <DashCard title={'Student Distribution by Course'} subtitle={'توزيع الطلاب حسب الكورس'} className='w-1 h-[500px]'><StudentDistributionChart /></DashCard> */}
      {/* <DashCard title={'Revenue & Student Growth'} subtitle={'الإيرادات ونمو الطلاب'} className='w-1 h-[500px]'><RevenueStudentGrowthChart /></DashCard> */}
      <div className="grid grid-cols-2 gap-4">
        <DashCard
          title="Student Distribution by Course"
          subtitle="توزيع الطلاب حسب الكورس"
          className="h-[500px]"
        >
          <StudentDistributionChart />
        </DashCard>

        <DashCard
          title="Revenue & Student Growth"
          subtitle="الإيرادات ونمو الطلاب"
          className="h-[500px]"
        >
          <RevenueStudentGrowthChart />
        </DashCard>
      </div>

      <div className="w-full mt-4">
        <DashCard className="w-full h-[500px]" title="Course Performance Metrics" subtitle="مقاييس أداء الكورسات">
          <CoursePerformanceChart />
        </DashCard>
      </div>

      <DashCard title="Key Performance Indicators" subtitle="مؤشرات الأداء الرئيسية" className='mt-4'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashCard className="h-[150px] bg-[#FBFAF4]" title="Avg. Course Completion" subtitle="متوسط إتمام الكورسات">
            <p className="text-xl">{avgCompletion}%</p>
          </DashCard>

          <DashCard className="h-[150px] bg-[#FBFAF4]" title="Avg. Student Satisfaction" subtitle="متوسط رضا الطلاب">
            <p className="text-xl">{avgSatisfaction}%</p>
          </DashCard>

          <DashCard className="h-[150px] bg-[#FBFAF4]" title="Active Enrollment Rate" subtitle="نسبة الطلاب المسجلين النشطين">
            <p className="text-xl">{activeRate}%</p>
          </DashCard>

          <DashCard className="h-[150px] bg-[#FBFAF4]" title="Monthly Growth" subtitle="نمو شهري">
            <p className={`text-xl ${monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              {monthlyGrowth >= 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`}
            </p>
          </DashCard>
        </div>
      </DashCard>
    </div>
  );
}