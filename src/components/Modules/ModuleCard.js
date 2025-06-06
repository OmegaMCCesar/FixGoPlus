// ModuleCard.js
import React from 'react';
import { Link } from 'react-router-dom';
// Icono de candado (puedes usar Heroicons u otro set de SVGs)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const ModuleCard = ({ module /*, progressPercentage, lessonsCompleted, totalLessons */ }) => {
  const isUnlocked = module.isUnlocked;

  // Estilos base para todas las tarjetas
  const cardBaseStyle = "p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden relative group border";

  // Estilos condicionales
  const unlockedCardSpecifics = "bg-neutral-white border-neutral-medium"; // Fondo blanco neutro, borde sutil
  const lockedCardSpecifics = "bg-neutral-medium border-gray-300 opacity-75 cursor-not-allowed";

  const cardStyle = isUnlocked
    ? `${cardBaseStyle} ${unlockedCardSpecifics}`
    : `${cardBaseStyle} ${lockedCardSpecifics}`;

  const titleStyle = isUnlocked
    ? "text-brand-blue group-hover:underline" // Azul de marca para título desbloqueado
    : "text-text-secondary"; // Gris para título bloqueado

  const descriptionStyle = isUnlocked
    ? "text-text-secondary"
    : "text-gray-500"; // Un gris un poco más claro o igual para descripción bloqueada

  // console.log(module, isUnlocked, 'log de prueba'); // Log para depuración (puedes quitarlo)

  return (
    <div className={cardStyle}>
      {/* Elemento decorativo sutil para tarjetas desbloqueadas */}
      {isUnlocked && (
        <div
          className="absolute top-0 right-0 h-28 w-28 bg-brand-blue opacity-10 group-hover:opacity-20 rounded-full -mr-10 -mt-10 transition-all duration-300 transform group-hover:scale-125"
        ></div>
      )}

      {!isUnlocked && (
        <div className="absolute top-4 right-4 text-neutral-dark opacity-60">
          <LockIcon />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full"> {/* Flex container para empujar botón abajo si es necesario */}
        <div className="flex-grow"> {/* Contenido principal que crece */}
          <h2 className={`text-2xl font-semibold mb-2 ${titleStyle}`}>{module.title}</h2>
          <p className={`text-sm ${descriptionStyle} mb-4`}>{module.description}</p>

          {/* --- Espacio para Barra de Progreso (futuro) --- */}
          {isUnlocked && module.progressPercentage !== undefined && ( // Ejemplo si tuvieras progreso
            <div className="my-4">
              <div className="w-full bg-neutral-medium rounded-full h-2.5">
                <div 
                  className="bg-brand-green h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${module.progressPercentage}%` }}
                ></div>
              </div>
              {module.lessonsCompleted !== undefined && module.totalLessons !== undefined && (
                <p className="text-xs text-text-secondary mt-1 text-right">
                  {module.lessonsCompleted} / {module.totalLessons} lecciones
                </p>
              )}
            </div>
          )}
          {/* --- Fin Barra de Progreso --- */}
        </div>

        {/* Botón de Acción */}
        <div className="mt-auto pt-4"> {/* Empuja el botón al final si el contenido es corto */}
          {isUnlocked ? (
            <Link
              to={`/modules/${module.id}`} // Asegúrate que esta sea la ruta correcta a tus niveles de módulo
              className="w-full text-center inline-block bg-accent-orange hover:bg-orange-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-opacity-75"
            >
              Empezar Módulo
            </Link>
          ) : (
            <button
              disabled
              className="w-full text-center inline-block bg-gray-400 text-gray-600 font-semibold py-2.5 px-5 rounded-lg cursor-not-allowed shadow-sm"
            >
              Bloqueado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;