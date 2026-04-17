import type React from "react";

type Inputprops = {
  id?: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  label: string;
  type?: string;
  autoComplete?: string;
};

export const Input = ({
  name,
  id,
  value,
  onChange,
  label,
  type = "text",
  autoComplete,
}: Inputprops) => {
  const inputId = id || name;

  return (
    <div className="relative">
      <input
        id={inputId}
        onChange={onChange}
        type={type}
        value={value}
        name={name}
        placeholder=" "
        autoComplete={autoComplete || name}
        className="peer w-full rounded-md bg-gray-50 px-3 pt-5 pb-2 outline-none"
      />

      <label
        htmlFor={inputId}
        className="
    absolute left-3 top-2 text-gray-500 text-sm
    transition-all
    peer-placeholder-shown:top-3
    peer-placeholder-shown:text-base
    peer-placeholder-shown:text-gray-400
    peer-focus:top-2
    peer-focus:text-sm
    peer-focus:text-black
    
  "
      >
        {label}
      </label>
    </div>
  );
};
