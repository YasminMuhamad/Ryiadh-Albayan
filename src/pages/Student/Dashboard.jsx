import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

// Components
import ProfileCard from "../../components/userDashboard/ProfileCard";
import StatsCards from "../../components/userDashboard/StatsCards";
import EnrollmentCard from "../../components/userDashboard/EnrollmentCard";
import { AttendanceCard, GradesCard } from "../../components/userDashboard/ProgressSection";
import LiveSessionsCard from "../../components/userDashboard/LiveSessionsCard";
import PaymentsCard from "../../components/userDashboard/PaymentsCard";
import { Tab } from "../../components/Tab";
import { LayoutDashboardIcon } from "lucide-react";

export default function StudentDashboard({ userId }) {
    const [user, setUser] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [coursesMap, setCoursesMap] = useState({});
    const [payments, setPayments] = useState([]);
    const [liveSessionsUpcoming, setLiveSessionsUpcoming] = useState([]);
    const [activeTab, setActiveTab] = useState("recorded");
    const [attendanceData, setAttendanceData] = useState([]);
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Fetch user ---
    useEffect(() => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        const unsubUser = onSnapshot(userRef, (snap) => {
            setUser(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        });
        return () => unsubUser();
    }, [userId]);

    // --- Fetch enrollments & courses & upcoming sessions ---
    useEffect(() => {
        if (!userId) return;
        let mounted = true;
        setLoading(true);

        const enrollRef = collection(db, "users", userId, "enrollments");
        const unsubEnroll = onSnapshot(enrollRef, async (snap) => {
            if (!mounted) return;
            const enrolls = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setEnrollments(enrolls);

            if (enrolls.length === 0) {
                setCoursesMap({});
                setLiveSessionsUpcoming([]);
                setLoading(false);
                return;
            }

            try {
                // 1️⃣ Fetch courses
                const courseIds = enrolls.map(e => e.courseId);
                const qCourses = query(collection(db, "courses"), where("__name__", "in", courseIds));
                const courseSnap = await getDocs(qCourses);

                // 2️⃣ Fetch teachers
                const teachersSnap = await getDocs(collection(db, "teachers"));
                const teachersMap = {};
                teachersSnap.forEach(t => { teachersMap[t.id] = t.data(); });

                // 3️⃣ Map courses
                const map = {};
                courseSnap.forEach(cDoc => {
                    const data = { id: cDoc.id, ...cDoc.data() };
                    const teacher = teachersMap[data.teacherId];
                    data.teacherName = teacher?.name_en || teacher?.name || "Unknown Instructor";
                    map[cDoc.id] = {
                        ...data,
                        type: data.type || "recorded",
                        title: data.title || "Untitled Course",
                        thumbnail: data.thumbnail || "/course-placeholder.png",
                    };
                });

                // 4️⃣ Fetch upcoming sessions in parallel
                const upcoming = [];
                await Promise.all(courseSnap.docs.map(async cDoc => {
                    const modulesSnap = await getDocs(collection(db, "courses", cDoc.id, "modules"));
                    await Promise.all(modulesSnap.docs.map(async modDoc => {
                        const lessonsSnap = await getDocs(collection(db, "courses", cDoc.id, "modules", modDoc.id, "lessons"));
                        lessonsSnap.docs.forEach(lessonDoc => {
                            const lesson = { id: lessonDoc.id, ...lessonDoc.data() };
                            const s = lesson.liveSession;
                            if (!s?.dateTime) return;

                            const dt = typeof s.dateTime.toDate === "function" ? s.dateTime.toDate() : new Date(s.dateTime);
                            if (dt <= new Date() || s.status === "cancelled") return;

                            upcoming.push({
                                courseId: cDoc.id,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title,
                                liveSession: s,
                                liveAt: dt.getTime(),
                                teacherId: map[cDoc.id].teacherId,
                                teacherName: map[cDoc.id].teacherName,
                            });
                        });
                    }));
                }));

                upcoming.sort((a, b) => a.liveAt - b.liveAt);

                // 5️⃣ Attach nextSession to courses
                const nextSessionByCourse = {};
                upcoming.forEach(s => {
                    if (!nextSessionByCourse[s.courseId]) nextSessionByCourse[s.courseId] = s;
                });
                Object.keys(map).forEach(cid => {
                    map[cid].nextSession = nextSessionByCourse[cid] || null;
                });

                if (!mounted) return;
                setCoursesMap(map);
                setLiveSessionsUpcoming(upcoming.slice(0, 5));
            } catch (err) {
                console.error("Error fetching courses/sessions:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            unsubEnroll();
        };
    }, [userId]);

    // --- Fetch payments ---
    useEffect(() => {
        if (!userId) return;
        const paymentsRef = collection(db, "payments");
        const qPayments = query(paymentsRef, where("studentId", "==", userId));
        const unsubPayments = onSnapshot(qPayments, (snap) => {
            const p = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            p.sort((a, b) => {
                const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
                const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
                return tb - ta;
            });
            setPayments(p.slice(0, 10));
        });
        return () => unsubPayments();
    }, [userId]);

    // --- Lazy load attendance & grades only when progress tab active ---
    useEffect(() => {
        if (activeTab !== "progress" || enrollments.length === 0) return;
        let mounted = true;

        async function loadAttendanceAndGrades() {
            const perCourse = {};
            const grades = [];

            await Promise.all(enrollments.map(async e => {
                const course = coursesMap[e.courseId];
                if (!course) return;
                perCourse[e.courseId] = { courseId: e.courseId, title: course.title, sessions: [] };

                // Attendance
                const modulesSnap = await getDocs(collection(db, "courses", e.courseId, "modules"));
                await Promise.all(modulesSnap.docs.map(async modDoc => {
                    const lessonsSnap = await getDocs(collection(db, "courses", e.courseId, "modules", modDoc.id, "lessons"));
                    await Promise.all(lessonsSnap.docs.map(async lessonDoc => {
                        const lesson = { id: lessonDoc.id, ...lessonDoc.data() };
                        const liveSession = lesson.liveSession;
                        if (!liveSession || !liveSession.dateTime) return;
                        const sessionDate = liveSession.dateTime.toDate ? liveSession.dateTime.toDate() : liveSession.dateTime;
                        if (sessionDate > new Date() || liveSession.status === "cancelled") return;

                        // Get student's status from attendence collection
                        const attRef = doc(db, "courses", e.courseId, "modules", modDoc.id, "lessons", lesson.id, "attendance", userId);
                        const attSnap = await getDoc(attRef);
                        const attData = attSnap.exists() ? attSnap.data() : null;

                        perCourse[e.courseId].sessions.push({
                            lessonId: lesson.id,
                            title: lesson.title,
                            status: attData?.status || "absent",
                            date: sessionDate.toISOString()
                        });
                    }));

                    // Grades
                    const quizzesSnap = await getDocs(collection(db, "courses", e.courseId, "modules", modDoc.id, "quizzes"));
                    await Promise.all(quizzesSnap.docs.map(async quizDoc => {
                        const quiz = { id: quizDoc.id, ...quizDoc.data() };
                        const submissionsSnap = await getDocs(collection(db, "courses", e.courseId, "modules", modDoc.id, "quizzes", quiz.id, "submissions"));
                        submissionsSnap.docs.forEach(sub => {
                            if (sub.id !== userId) return;
                            const s = sub.data();
                            grades.push({ title: quiz.title, course: course.title, score: s.score, status: s.status, date: s.submittedAt?.toDate?.().toLocaleDateString() });
                        });
                    }));
                }));
            }));

            if (!mounted) return;
            setAttendanceData(Object.values(perCourse));
            setGradesData(grades);
        }

        loadAttendanceAndGrades();
        return () => { mounted = false; };
    }, [activeTab, enrollments, coursesMap, userId]);

    const totalCoursesCount = enrollments.length;
    const activeCoursesCount = enrollments.filter(e => e.status !== "completed").length;
    const completedCoursesCount = enrollments.filter(e => e.status === "completed").length;
    const subscriptionStatus = user?.subscriptionStatus || "-";

    const filteredEnrollments = enrollments.filter(e => {
        const course = coursesMap[e.courseId];
        if (!course) return false;
        return course.type === activeTab;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#0E7C7B]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3z" />
                    </svg> */}
                    <LayoutDashboardIcon />
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">My Learning Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Quick overview of your progress, subscriptions, and content
                        </p>
                    </div>
                </div>

                {/* <button className="px-4 py-2 bg-[#0E7C7B] text-white rounded-lg text-sm hover:bg-[#0c6261] transition">
                    View Profile
                </button> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Profile + Stats */}
                <div className="lg:col-span-4 flex flex-col lg:flex-row gap-4 w-full">
                    <ProfileCard
                        user={user}
                        totalCoursesCount={totalCoursesCount}
                        subscriptionStatus={subscriptionStatus}
                        className="w-full lg:w-1/4" // ثابت على 1/4 على الشاشات الكبيرة
                    />
                    <StatsCards
                        activeCoursesCount={activeCoursesCount}
                        completedCoursesCount={completedCoursesCount}
                        liveSessionsUpcomingCount={liveSessionsUpcoming.length}
                        className="flex-1" // ياخد باقي المساحة
                    />
                </div>

                {/* باقي الـ layout */}
                <div className="col-span-1 lg:col-span-3">
                    <Tab activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === "progress" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AttendanceCard data={attendanceData} />
                            <GradesCard data={gradesData} />
                        </div>
                    )}
                    {activeTab !== "progress" && (
                        <div className="mt-4 space-y-3">
                            {filteredEnrollments.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    You are not enrolled in any course yet.
                                </div>
                            )}
                            {filteredEnrollments.map(e => (
                                <EnrollmentCard key={e.courseId} enrollment={e} course={coursesMap[e.courseId]} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-span-1 space-y-4">
                    <LiveSessionsCard sessions={liveSessionsUpcoming} />
                    <PaymentsCard payments={payments} coursesMap={coursesMap} />
                </div>
            </div>

        </div>
    );
}