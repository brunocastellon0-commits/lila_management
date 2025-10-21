import React from "react";

const BotonSocial = ({ claseIcono, color }) => {
  return (
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer`}
    >
      <i className={`${claseIcono}`} style={{ color: color, fontSize: "1.25rem" }}></i>
    </div>
  );
};

export default BotonSocial;
