import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ label, placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col w-full mb-4">
      <label className="font-medium text-[var(--foreground)] mb-1">
        {label}
      </label>
      <div
        className="
          flex items-center
          border border-[var(--border)]
          rounded-full px-4 py-2 bg-white
          transition-all
          focus-within:border-[var(--primary)]
          focus-within:focus-within:ring-[var(--primary)]
          focus-within:shadow-[0_0_10px_rgba(14,124,123,0.55)]
        "
      >
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="
            flex-1 outline-none
            bg-transparent
            text-[var(--foreground)]
          "
        />

        {show ? (
          <EyeOff
            className="cursor-pointer text-gray-400"
            onClick={() => setShow(false)}
          />
        ) : (
          <Eye
            className="cursor-pointer text-gray-400"
            onClick={() => setShow(true)}
          />
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
