// src/pages/success.js
import React from 'react';
import { Link } from 'react-router-dom'; // Si usas React Router

const SuccessPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        <p className="text-lg mb-6">Gracias por tu compra. Tu pago ha sido procesado correctamente.</p>
        <Link to="/" className="bg-brand-blue text-white py-2 px-6 rounded-lg">Volver al inicio</Link>
      </div>
    </div>
  );
};

export default SuccessPage;
