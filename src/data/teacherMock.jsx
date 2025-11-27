export const mockCourses = [
  {
    id: "c-001",
    title_ar: "تلاوة القرآن الكريم للأطفال",
    title_en: "Quran Recitation for Children",
    students: 128,
    status: "Published",
    thumbnail: "", 
  },
  {
    id: "c-002",
    title_ar: "الخط العربي والزخرفة الإسلامية",
    title_en: "Arabic Calligraphy & Islamic Ornament",
    students: 24,
    status: "Draft",
    thumbnail: "",
  },
  {
    id: "c-003",
    title_ar: "تعليم التجويد للأطفال",
    title_en: "Tajweed Learning for Kids",
    students: 56,
    status: "Published",
    thumbnail: "",
  },
];

// Live sessions data
export const mockSessions = [
  {
    id: "s-001",
    courseId: "c-001",
    title: "Live Recitation Practice",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), 
    durationMin: 60,
    status: "upcoming",
  },
  {
    id: "s-002",
    courseId: "c-002",
    title: "Calligraphy Workshop",
    startAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    durationMin: 90,
    status: "live",
  },
  {
    id: "s-003",
    courseId: "c-003",
    title: "Tajweed Basics",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), 
    durationMin: 45,
    status: "upcoming",
  },
];

export const mockStudents = [
  { id: "st-001", name: "Aisha Hassan", progress: 72 },
  { id: "st-002", name: "Mohammed Ali", progress: 52 },
  { id: "st-003", name: "Fatma Mahmoud", progress: 85 },
  { id: "st-004", name: "Omar Adel", progress: 40 },
];