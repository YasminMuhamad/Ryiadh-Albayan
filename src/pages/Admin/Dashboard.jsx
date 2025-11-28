import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { DashCard } from "../../components/DashCard";
import { PlusCircle, CircleUser, Users, BookOpen, ChartColumnIcon, DollarSign } from 'lucide-react';
import { Button } from "../../components/Button";
import { AddTeacherModal } from "../../components/AddTeacherModal";
import { AddCourseModal } from "../../components/AddCourseModal";
import { collection, onSnapshot, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase.config";

export function AdminDashboard() {
    const [isTeacherModalOpen, setTeacherModalOpen] = useState(false);
    const [isCourseModalOpen, setCourseModalOpen] = useState(false);

    const [teachersStats, setTeachersStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [coursesStats, setCoursesStats] = useState({ total: 0, published: 0, draft: 0 });
    const [studentsStats, setStudentsStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [analyticsStats, setAnalyticsStats] = useState({ coursesCompleted: 0, quizzesTaken: 0, avgCompletion: 0 });
    const [revenueStats, setRevenueStats] = useState({ total: 0, thisMonth: 0, activeSubscriptions: 0, avgPerStudent: 0 });

    // Fetch Teachers
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "teachers"), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const total = list.length;
            const active = list.filter(t => t.status === "Active").length;
            const inactive = total - active;
            setTeachersStats({ total, active, inactive });
        });
        return () => unsubscribe();
    }, []);

    // Fetch Courses
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "courses"), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const total = list.length;
            const published = list.filter(s => s.status === "Published").length; // Example: published if has students
            const draft = total - published;
            setCoursesStats({ total, published, draft });
        });
        return () => unsubscribe();
    }, []);

    // Fetch Students & Analytics
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), async (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const students = list.filter(u => u.role === "student");
            const total = students.length;
            const active = students.filter(s => s.subscriptionStatus === "Active").length;
            const inactive = total - active;
            setStudentsStats({ total, active, inactive });

            // Analytics
            let totalCompleted = 0;
            let totalPercentSum = 0;
            let quizzesTaken = 0;

            await Promise.all(students.map(async (student) => {
                const enrollSnap = await getDocs(collection(db, "users", student.id, "enrollments"));
                enrollSnap.forEach(e => {
                    if (e.data().status === "completed") totalCompleted += 1;
                    totalPercentSum += e.data().percent || 0;
                    if (e.data().quizzesTaken) quizzesTaken += e.data().quizzesTaken; // if you store quizzesTaken per enrollment
                });
            }));

            const avgCompletion = students.length > 0 ? Math.round(totalPercentSum / students.length) : 0;
            setAnalyticsStats({ coursesCompleted: totalCompleted, quizzesTaken, avgCompletion });
        });
        return () => unsubscribe();
    }, []);

    // Fetch Revenue
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "payments"), (snap) => {
            let total = 0;
            let thisMonth = 0;
            const activeSubscriptionsSet = new Set();
            const now = new Date();

            snap.docs.forEach(doc => {
                const data = doc.data();
                if (data.status === "paid") {
                    total += data.amount;
                    activeSubscriptionsSet.add(data.studentId);
                    const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
                    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                        thisMonth += data.amount;
                    }
                }
            });

            const activeSubscriptions = activeSubscriptionsSet.size;
            const avgPerStudent = activeSubscriptions > 0 ? (total / activeSubscriptions).toFixed(2) : 0;
            setRevenueStats({ total, thisMonth, activeSubscriptions, avgPerStudent });
        });

        return () => unsubscribe();
    }, []);

    const onButtonClick = (action) => {
        if (action === "add_teacher") setTeacherModalOpen(true);
        else if (action === "add_course") setCourseModalOpen(true);
    };

    return (
        <>
            <AddTeacherModal isOpen={isTeacherModalOpen} onClose={() => setTeacherModalOpen(false)} />
            <AddCourseModal isOpen={isCourseModalOpen} onClose={() => setCourseModalOpen(false)} teachers={[]} terms={[]} />
            <div className="mb-4">
                <Title className="text-lg" enTitle="Dashboard Overview" arTitle="نظرة عامة على لوحة التحكم" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashCard icon={CircleUser} title="Teachers" subtitle="إدارة المعلمين">
                    <p>Total Teachers: <strong>{teachersStats.total}</strong></p>
                    <p className="text-gray-500">Active: {teachersStats.active} | Inactive: {teachersStats.inactive}</p>
                </DashCard>

                <DashCard icon={BookOpen} title="Courses" subtitle="إدارة الدورات">
                    <p>Total Courses: <strong>{coursesStats.total}</strong></p>
                    <p className="text-gray-500">Published: {coursesStats.published} | Draft: {coursesStats.draft}</p>
                </DashCard>

                <DashCard icon={Users} title="Students" subtitle="إدارة الطلاب">
                    <p>Total Students: <strong>{studentsStats.total}</strong></p>
                    <p className="text-gray-500">Active: {studentsStats.active} | Inactive: {studentsStats.inactive}</p>
                </DashCard>

                <DashCard icon={ChartColumnIcon} title="Analytics" subtitle="إحصائيات عامة">
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Courses Completed:</span><span>{analyticsStats.coursesCompleted}</span></div>
                        <div className="flex justify-between"><span>Quizzes Taken:</span><span>{analyticsStats.quizzesTaken}</span></div>
                        <div className="flex justify-between"><span>Avg. Completion Rate:</span><span>{analyticsStats.avgCompletion}%</span></div>
                        <div className="flex justify-between"><span>Active Students:</span><span>{studentsStats.active}</span></div>
                    </div>
                </DashCard>

                <DashCard
                    icon={DollarSign}
                    title="Revenue Overview"
                    subtitle="أرباح المنصة"
                    className="sm:col-span-2 lg:col-span-2"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-gray-500">Total Revenue</span>
                            <span className="font-semibold">USD {revenueStats.total}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">This Month</span>
                            <span className="font-semibold">USD {revenueStats.thisMonth}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Active Subscriptions</span>
                            <span className="font-semibold">{revenueStats.activeSubscriptions}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Avg. Revenue per Student</span>
                            <span className="font-semibold">USD {revenueStats.avgPerStudent}</span>
                        </div>
                    </div>
                </DashCard>

            </div>
        </>
    );
}
