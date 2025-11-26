import React from "react";

const TextInput = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
  min,
  ...rest
}) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold text-gray-200">
            {label}
          </span>
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input input-bordered w-full bg-[#30475E] text-white"
        required={required}
        min={min}
        {...rest}
      />
    </div>
  );
};

export default TextInput;
