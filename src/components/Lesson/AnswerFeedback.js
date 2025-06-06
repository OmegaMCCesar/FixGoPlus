// src/components/Lesson/AnswerFeedback.js
import React from 'react';

// Icono para respuesta correcta
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

// Icono para respuesta incorrecta
const ExclamationTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-4.5a1.75 1.75 0 00-3.5 0v.25a1.75 1.75 0 003.5 0v-.25z" clipRule="evenodd" />
 </svg>
);


const AnswerFeedback = ({ feedback }) => {
  if (!feedback) {
    return null; // No mostrar nada si no hay feedback
  }

  // Una forma un poco más robusta de determinar si es correcto,
  // asumiendo que el feedback podría variar un poco.
  // Podrías pasar un prop booleano `isCorrect` directamente para más fiabilidad.
  const isCorrect = feedback.type === 'success' || (typeof feedback === 'string' && feedback.toLowerCase().includes('correcto'));
  const message = typeof feedback === 'string' ? feedback : feedback.message;


  const baseClasses = "rounded-lg py-3 px-4 mb-4 font-semibold border-l-4 shadow-md text-sm md:text-base flex items-center";

  let specificClasses = "";
  let IconComponent = null;

  if (isCorrect) {
    specificClasses = "bg-green-50 border-brand-green text-green-700"; // Usando brand-green para el borde
    IconComponent = <CheckIcon />;
  } else {
    specificClasses = "bg-red-50 border-accent-red text-red-700"; // Usando accent-red para el borde
    IconComponent = <ExclamationTriangleIcon />;
  }

  return (
    <div className={`${baseClasses} ${specificClasses}`}>
      {IconComponent}
      <span>{message}</span>
    </div>
  );
};

export default AnswerFeedback;