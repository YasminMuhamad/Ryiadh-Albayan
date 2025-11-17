export const mockCourses = [
  {
    id: "c-001",
    title_ar: "تلاوة القرآن الكريم للأطفال",
    title_en: "Quran Recitation for Children",
    students: 128,
    status: "Published",
    thumbnail: ""
  },
  {
    id: "c-002",
    title_ar: "الخط العربي والزخرفة الإسلامية",
    title_en: "Arabic Calligraphy & Islamic Ornament",
    students: 24,
    status: "Draft",
    thumbnail: ""
  }
];

export const mockSessions = [
  {
    id: "s-1",
    courseId: "c-001",
    title: "Live Recitation Practice",
    startAt: new Date(Date.now() + 1000*60*60*24).toISOString(), // tomorrow
    durationMin: 60,
    status: "upcoming"
  },
  {
    id: "s-2",
    courseId: "c-002",
    title: "Calligraphy Workshop",
    startAt: new Date(Date.now() - 1000*60*30).toISOString(), // 30 min ago (live)
    durationMin: 90,
    status: "live"
  }
];

export const mockStudents = [
  { id: "st-1", name: "Aisha Hassan", progress: 72 },
  { id: "st-2", name: "Mohammed Ali", progress: 52 }
];
