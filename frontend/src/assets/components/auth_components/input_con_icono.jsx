import React from "react";

const InputConIcono = ({ id, type, placeholder, icono, value, onChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {placeholder}
      </label>
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
        <i className={`${icono} text-gray-400 mr-2`}></i>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default InputConIcono;
