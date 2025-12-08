import React from "react";

const BotonSocial = ({ children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#13161C] border border-white/10 shadow-lg shadow-black/40 hover:border-[#2A9D8F] hover:shadow-[0_0_15px_rgba(42,157,143,0.3)] hover:scale-110 transition-all duration-300 cursor-pointer group hover:bg-[#1c212c]"
    >
      {children}
    </button>
  );
};

export default BotonSocial;