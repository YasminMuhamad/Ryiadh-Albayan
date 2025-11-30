import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Video } from "lucide-react";
import { Tab } from "../../components/Tab";

// helper: format date
// helper كامل
const fmt = (ts) => {
    if (!ts) return "-";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString(); // تاريخ + وقت
    } catch {
        return String(ts);
    }
};

const fmtDateOnly = (ts) => {
    if (!ts) return "-";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString();
    } catch {
        return String(ts);
    }
};

export default function StudentDashboard({ userId }) {
    const [user, setUser] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [coursesMap, setCoursesMap] = useState({});
    const [payments, setPayments] = useState([]);
    const [liveSessionsUpcoming, setLiveSessionsUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("recorded");

    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        let mounted = true;

        // listen to user doc (profile)
        const userRef = doc(db, "users", userId);
        const unsubUser = onSnapshot(userRef, (snap) => {
            if (!mounted) return;
            if (!snap.exists()) return setUser(null);
            setUser({ id: snap.id, ...snap.data() });
        });

        // listen enrollments subcollection (real-time)
        const enrollmentsCol = collection(db, "users", userId, "enrollments");
        const unsubEnroll = onSnapshot(enrollmentsCol, async (snap) => {
            if (!mounted) return;
            const enrolls = snap.docs.map((s) => ({ id: s.id, ...s.data() }));
            setEnrollments(enrolls);

            setCoursesMap({});
            setLiveSessionsUpcoming([]);

            if (!enrolls.length) {
                setLoading(false);
                return;
            }

            try {
                const courseIds = enrolls.map((e) => e.courseId);
                const coursesRef = collection(db, "courses");
                const q = query(coursesRef, where("__name__", "in", courseIds));
                const courseSnap = await getDocs(q);

                const teachersSnap = await getDocs(collection(db, "teachers"));
                const teachersMap = {};
                teachersSnap.forEach((t) => {
                    teachersMap[t.id] = t.data();
                });

                const map = {};
                const upcoming = [];

                for (const cDoc of courseSnap.docs) {
                    const cData = { id: cDoc.id, ...cDoc.data() };
                    const teacher = teachersMap[cData.teacherId];
                    cData.teacherName = teacher ? teacher.name_ar || teacher.name || "مدرب" : "مدرب غير معروف";

                    // --- fetch modules as subcollection ---
                    const modulesSnap = await getDocs(collection(db, "courses", cDoc.id, "modules"));
                    for (const modDoc of modulesSnap.docs) {
                        const modData = { id: modDoc.id, ...modDoc.data() };

                        // --- fetch lessons as subcollection ---
                        const lessonsSnap = await getDocs(collection(db, "courses", cDoc.id, "modules", modDoc.id, "lessons"));
                        for (const lessonDoc of lessonsSnap.docs) {
                            const lessonData = { id: lessonDoc.id, ...lessonDoc.data() };

                            const s = lessonData.liveSession; // liveSession is map inside lesson
                            console.log("Checking live session:", s);
                            if (!s?.dateTime) continue;                 // no live session
                            const dt = s.dateTime.toDate()
                            if (isNaN(dt.getTime())) continue;         // invalid date
                            if (dt <= new Date()) continue;            // not future
                            if (s.status === "cancelled") continue;    // cancelled

                            upcoming.push({
                                courseId: cDoc.id,
                                courseTitle: cData.title,
                                lessonId: lessonData.id,
                                lessonTitle: lessonData.title,
                                liveSession: s,
                                liveAt: dt.getTime(),
                                teacherId: cData.teacherId,
                                teacherName: cData.teacherName,
                            });
                            console.log("  -> upcoming live session found:", cData.title, lessonData.title, dt);
                        }
                    }

                    map[cDoc.id] = cData;
                }

                upcoming.sort((a, b) => a.liveAt - b.liveAt);
                if (!mounted) return;
                setCoursesMap(map);
                setLiveSessionsUpcoming(upcoming.slice(0, 5));
            } catch (err) {
                console.error("fetch courses/modules/lessons error", err);
            } finally {
                if (mounted) setLoading(false);
            }
        });

        // payments listener
        const paymentsRef = collection(db, "payments");
        const qPayments = query(paymentsRef, where("studentId", "==", userId));
        const unsubPayments = onSnapshot(qPayments, (snap) => {
            if (!mounted) return;
            const p = snap.docs.map((s) => ({ id: s.id, ...s.data() }));
            p.sort((a, b) => {
                const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
                const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
                return tb - ta;
            });
            setPayments(p.slice(0, 10));
        });

        return () => {
            mounted = false;
            try { unsubUser(); } catch (e) { }
            try { unsubEnroll(); } catch (e) { }
            try { unsubPayments(); } catch (e) { }
        };
    }, [userId]);

    const totalCoursesCount = enrollments.length;
    const activeCoursesCount = enrollments.filter(e => e.status !== "completed").length;
    const completedCoursesCount = enrollments.filter((e) => e.status === "completed").length;
    const subscriptionStatus = user?.subscriptionStatus || "-";
    const avgProgress = enrollments.length
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.percent ?? 0), 0) / enrollments.length)
        : 0;

    // console.log("User data:", user);
    const filteredEnrollments = enrollments.filter((e) => {
        const course = coursesMap[e.courseId];
        if (!course) return false;
        return course.type === activeTab; // activeTab = "recorded" أو "interactive"
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">لوحة التحكم للطالب</h1>
                    <p className="text-sm text-muted-foreground">
                        نظرة سريعة على تقدمك، اشتراكاتك، والمحتوى
                    </p>
                </div>
            </div>

            {/* Profile + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <img
                            src={user?.profile_pic || "/placeholder-avatar.png"}
                            alt="avatar"
                            className="w-16 h-16 rounded-full object-cover border"
                        />
                        <div>
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-sm text-muted-foreground">{user?.email}</div>
                            <div className="mt-2 text-xs">
                                الحالة: <span className="font-semibold">{subscriptionStatus}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-3 text-sm text-muted-foreground space-y-1">
                        <div>تاريخ التسجيل: {fmtDateOnly(user?.createdAt)}</div>
                        <div>عدد الكورسات: {totalCoursesCount}</div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <div className="text-sm text-muted-foreground">كورسات نشطة</div>
                        <div className="text-xl font-semibold">{activeCoursesCount}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-muted-foreground">كورسات مكتملة</div>
                        <div className="text-xl font-semibold">{completedCoursesCount}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-muted-foreground">جلسات مباشرة قادمة</div>
                        <div className="text-xl font-semibold">{liveSessionsUpcoming.length}</div>
                    </Card>
                    {/* <Card>
                        <div className="text-sm text-muted-foreground">Avg. Progress</div>
                        <div className="text-xl font-semibold">{avgProgress}%</div>
                        <div className="text-xs text-muted-foreground">Across all courses</div>
                    </Card> */}

                </div>

                {/* Enrollments */}
                <div className="col-span-1 lg:col-span-3">
                    <Tab activeTab={activeTab} setActiveTab={setActiveTab} />
                    {/* <Card>
                        <div className="flex items-center justify-between">
                            <h2 className="font-medium">الكورسات المسجل بها</h2>
                            <div className="text-sm text-muted-foreground">{filteredEnrollments.length} كورس</div>
                        </div> */}
                    <div className="mt-4 space-y-3">
                        {filteredEnrollments.length === 0 && <div className="text-sm text-muted-foreground">لم تسجل في أي كورس بعد.</div>}
                        {filteredEnrollments.map((e) => {
                            const course = coursesMap[e.courseId] || {};
                            return (
                                <Card key={e.courseId} className="flex items-center gap-4 relative p-4">
                                    {/* Badge */}
                                    <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full 
                                    ${e.status === "completed" ? "bg-[#0E7C7B] text-white" :
                                            e.status === "in-progress" ? "bg-[#E9D8A6] text-black" :
                                                "bg-gray-300 text-black"}`}>
                                        {e.status}
                                    </div>

                                    <img
                                        src={course.thumbnail || "/course-placeholder.png"}
                                        alt="thumb"
                                        className="w-40 h-40 object-cover rounded-3xl"
                                    />

                                    <div className="flex-1">
                                        <div className="font-medium">{course.title || e.courseId}</div>

                                        <div className="text-xs text-gray-600">
                                            {course.description
                                                ? (course.description.length > 100
                                                    ? course.description.slice(0, 100) + "..."
                                                    : course.description)
                                                : "-"}
                                        </div>
                                        <div className="text-sm text-muted-foreground text-[#0E7C7B]">
                                            {course.teacherId ? `مع ${course.teacherName}` : "مدرب غير معروف"}
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <div className="flex justify-between items-center mt-3 mb-1">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="text-xs text-[#0E7C7B]">{e.percent ?? 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                                                <div
                                                    style={{ width: `${e.percent ?? 0}%` }}
                                                    className="h-2 bg-[#0E7C7B]"
                                                />
                                            </div>
                                        </div>
                                        <Button className="btn-primary py-1 px-3 text-sm my-2" title={'Continue Learning'} icon={Video} />
                                    </div>

                                    {/* تاريخ التسجيل والدروس المكتملة في الركن الأيمن السفلي */}
                                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground text-right">
                                        <div>تسجل بتاريخ: {fmtDateOnly(e.enrolledAt)}</div>
                                        <div>دروس مكتملة: {e.completedLessonsCount ?? (e.completedLessons?.length ?? 0)}</div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                    {/* </Card> */}
                </div>

                {/* Right column */}
                <div className="col-span-1 space-y-4">
                    <Card>
                        <h3 className="font-medium">جلسات مباشرة قادمة</h3>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {liveSessionsUpcoming.length === 0 && <div>لا توجد جلسات مباشرة قادمة.</div>}
                            {liveSessionsUpcoming.map((s, i) => (
                                <div key={i} className="border p-2 rounded">
                                    <div className="font-medium">{s.courseTitle}</div>
                                    <div className="text-xs">{s.lessonTitle}</div>
                                    <div className="text-xs">{fmt(s.liveSession.dateTime)}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-medium">أحدث المدفوعات</h3>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {payments.length === 0 && <div>لا توجد مدفوعات.</div>}
                            {payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{p.courseId || "عام"}</div>
                                        <div className="text-xs">{p.amount} {p.currency} • {p.type}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{fmt(p.createdAt)}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

{/* دول يظهروا في تابة البروجرس */}
        

            <div className="text-xs text-muted-foreground mt-4">
                ملاحظة: كل المعلومات تأتي مباشرة من قاعدة البيانات (users, enrollments, courses, payments)
            </div>
        </div>
    );
}
