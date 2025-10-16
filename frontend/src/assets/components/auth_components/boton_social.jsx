import React from "react";

const BotonSocial = ({ claseIcono, color }) => {
  return (
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:scale-110 transition-transform cursor-pointer`}
    >
      <i className={`${claseIcono}`} style={{ color: color, fontSize: "1.25rem" }}></i>
    </div>
  );
};

export default BotonSocial;
