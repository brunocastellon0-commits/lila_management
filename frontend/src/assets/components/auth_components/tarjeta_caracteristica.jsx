import React from "react";

const TarjetaCaracteristica = ({ claseIcono, texto }) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-md hover:shadow-xl hover:scale-105 transition-transform transition-shadow cursor-pointer">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-800 text-white text-lg">
        <i className={claseIcono}></i>
      </div>
      <div className="text-gray-900 font-semibold text-base">{texto}</div>
    </div>
  );
};

export default TarjetaCaracteristica;
