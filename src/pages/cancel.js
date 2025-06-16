// src/pages/cancel.js
import React from 'react';
import { Link } from 'react-router-dom'; // Si usas React Router

const CancelPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Cancelado</h1>
        <p className="text-lg mb-6">Lo sentimos, tu pago no fue completado.</p>
        <p className="text-sm text-gray-600 mb-8">Si tienes algún problema, por favor intenta nuevamente o contacta con soporte.</p>
        <Link to="/" className="bg-brand-blue text-white py-2 px-6 rounded-lg">Volver al inicio</Link>
      </div>
    </div>
  );
};

export default CancelPage;
