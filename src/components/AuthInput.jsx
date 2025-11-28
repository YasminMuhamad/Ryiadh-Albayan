const AuthInput = ({ label, type="text", placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col w-full mb-4">
      <label className="font-medium text-[var(--foreground)] mb-1">{label}</label>
      <input
  type={type}
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  // className="
  //   border border-[var(--border)]
  //   rounded-full px-4 py-2
  //   bg-white
  //   outline-none
  //   transition
  //   focus:ring-1 focus:ring-[var(--primary)]
  //   focus:shadow-[0_0_10px_rgba(14,124,123,0.55)]
  // "
/>

    </div>
  );
};

export default AuthInput;
