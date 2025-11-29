import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ placeholder, onBlur, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        className="w-full pr-10 px-3 py-2"
      />

      <div
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff /> : <Eye />}
      </div>
    </div>
  );
};

export default PasswordInput;
