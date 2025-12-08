import React from "react";

const InputConIcono = ({ id, type, placeholder, Icon, value, onChange, gradient = "bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F]" }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-400 font-medium mb-1 ml-1 text-sm">
        {placeholder}
      </label>
      <div className="flex items-center border border-white/10 rounded-2xl px-4 py-3 bg-[#0c0e12] shadow-inner focus-within:ring-1 focus-within:ring-[#2A9D8F] focus-within:border-[#2A9D8F] transition-all duration-300 hover:border-white/20 group">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${gradient} text-white mr-3 shadow-lg shadow-black/40 group-focus-within:scale-110 transition-transform`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="flex-1 outline-none text-white placeholder-gray-600 bg-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default InputConIcono;