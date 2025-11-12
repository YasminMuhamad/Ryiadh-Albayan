// import { Badge } from 'lucide-react'; // استيراد الأيقونة

export function Btn({ className, title, icon }) {
  return (
    <button className={className}>
      {/* {icon && React.cloneElement(icon, { style: { fontSize: '18px', marginRight: '8px' } })} إضافة الأيقونة مع تعديل الحجم */}
      {title}
    </button>
  );
}
