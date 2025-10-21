import React from "react";

const InputConIcono = ({ id, type, placeholder, icono, value, onChange, gradient = "bg-gradient-to-br from-teal-500 to-cyan-500" }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {placeholder}
      </label>
      <div className="flex items-center border border-border rounded-2xl px-4 py-3 bg-gray-50 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-teal-400 transition-all duration-300">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${gradient} text-white mr-3`}>
          <i className={icono}></i>
        </div>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>
    </div>
  );
};

export default InputConIcono;
