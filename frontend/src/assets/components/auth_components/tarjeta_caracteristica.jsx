import React from "react";

const TarjetaCaracteristica = ({ claseIcono, texto, gradient = "bg-gradient-to-br from-teal-500 to-cyan-500" }) => {
  return (
    <div className="group bg-white rounded-2xl p-4 border border-border hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-3">
      <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center text-white text-lg transition-transform duration-300 group-hover:scale-110`}>
        <i className={claseIcono}></i>
      </div>
      <div className="text-gray-900 font-semibold text-base">{texto}</div>
    </div>
  );
};

export default TarjetaCaracteristica;
