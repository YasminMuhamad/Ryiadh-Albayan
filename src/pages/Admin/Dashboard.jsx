import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { DashCard } from "../../components/DashCard";
import { PlusCircle, Edit, Trash, UserCheck, ChartColumnIcon, DollarSign, CircleUser, Users, BookOpen, UserX } from 'lucide-react';
import { Button } from "../../components/Button";
import { AddTeacherModal } from "../../components/AddTeacherModal";
import { AddCourseModal } from "../../components/AddCourseModal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase.config";

export function AdminDashboard() {
    const [isTeacherModalOpen, setTeacherModalOpen] = useState(false);
    const [isCourseModalOpen, setCourseModalOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "teachers"), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setTeachers(list);
        }, (err) => console.error("load teachers err", err));

        return () => unsubscribe();
    }, []);


    const onButtonClick = (action) => {
        if (action === "add_teacher") {
            setTeacherModalOpen(true);
        }
        else if (action === "add_course") {
            setCourseModalOpen(true);
        }
    };

    return (
        <>
            {/* Modals */}
            <AddTeacherModal
                isOpen={isTeacherModalOpen}
                onClose={() => setTeacherModalOpen(false)}
            />
            <AddCourseModal
                isOpen={isCourseModalOpen}
                onClose={() => setCourseModalOpen(false)}
                teachers={teachers}
                terms={[]}
            />

            <Title enTitle="Dashboard Overview" arTitle="نظرة عامة على لوحة التحكم"/>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Teachers Card */}
                <DashCard
                    icon={CircleUser}
                    title={'Teachers'}
                    subtitle="إدارة المعلمين"
                    actions={[
                        // <Button key="add_teacher" className="btn-primary" icon={PlusCircle} title="Add" onClick={() => onButtonClick('add_teacher')} />,
                        // <Button key="edit_teacher" className="btn-secondary" icon={Edit} title="Edit" onClick={() => onButtonClick('edit_teacher')} />,
                        // <Button key="delete_teacher" className="btn-secondary text-red-500" icon={Trash} title="Delete" onClick={() => onButtonClick('delete_teacher')} />,
                    ]}
                >
                    <div className="space-y-1">
                        <p>Total Teachers: <strong>42</strong></p>
                        <p className="text-gray-500">Active: 38 | Inactive: 4</p>
                    </div>
                </DashCard>

                {/* Courses Card */}
                <DashCard
                    icon={BookOpen}
                    title={'Courses'}
                    subtitle="إدارة الدورات"
                    actions={[
                        // <Button key="add_course" className="btn-primary" icon={PlusCircle} title="Add" onClick={() => onButtonClick('add_course')} />,
                        // <Button key="edit_course" className="btn-secondary" icon={Edit} title="Edit" onClick={() => onButtonClick('edit_course')} />,
                        // <Button key="delete_course" className="btn-secondary text-red-500" icon={Trash} title="Delete" onClick={() => onButtonClick('delete_course')} />,
                    ]}
                >
                    <div className="space-y-1">
                        <p>Total Courses: <strong>28</strong></p>
                        <p className="text-gray-500">Published: 24 | Draft: 4</p>
                    </div>
                </DashCard>

                {/* Students Card */}
                <DashCard
                    icon={Users}
                    title={'Students'}
                    subtitle="إدارة الطلاب"
                    actions={[
                        // <Button key="activate" className="btn-primary" icon={UserCheck} title="Activate" onClick={() => onButtonClick('activate')} />,
                        // <Button key="deactivate" className="btn-secondary" icon={UserX} title="Deactivate" onClick={() => onButtonClick('deactivate')} />,
                    ]}
                >
                    <div className="space-y-1">
                        <p>Total Students: <strong>1,247</strong></p>
                        <p className="text-gray-500">Active: 1,189 | Inactive: 58</p>
                    </div>
                </DashCard>



                {/* Analytics Card */}
                <DashCard
                    icon={ChartColumnIcon}
                    title={'Analytics'}
                    subtitle="إحصائيات عامة"
                >
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Courses Completed:</span>
                            <span className="font-semibold">892</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Quizzes Taken:</span>
                            <span className="font-semibold">3,456</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Avg. Completion Rate:</span>
                            <span className="font-semibold">78%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Active Students:</span>
                            <span className="font-semibold">1,189</span>
                        </div>
                    </div>
                </DashCard>

                {/* Revenue Overview */}
                <DashCard
                    icon={DollarSign}
                    title={'Revenue Overview'}
                    subtitle="أرباح المنصة"
                    className="sm:col-span-2 lg:col-span-2"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-gray-500">Total Revenue</span>
                            <span className="font-semibold">SAR 124,560</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">This Month</span>
                            <span className="font-semibold">SAR 18,450</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Active Subscriptions</span>
                            <span className="font-semibold">856</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Avg. Revenue per Student</span>
                            <span className="font-semibold">SAR 99.80</span>
                        </div>
                    </div>
                </DashCard>

            </div>
        </>
    );
}
