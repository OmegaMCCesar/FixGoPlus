// src/components/Modules/ModuleCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const ModuleCard = ({ module }) => {
  const { id, title, description, iconUrl, isUnlocked, adiamantado } = module;

  const baseClasses = "rounded-2xl shadow-md overflow-hidden transition-all duration-300 border flex flex-col justify-between";
  const unlockedStyle = "bg-white border-neutral-medium hover:shadow-xl hover:-translate-y-1 transform";
  const lockedStyle = "bg-neutral-medium border-gray-300 opacity-75 cursor-not-allowed";
  const adiamantadoStyle = "border-4 border-cyan-400 animate-pulse ring-2 ring-cyan-300 shadow-cyan-500/50";

  const cardClasses = `${baseClasses} ${isUnlocked ? unlockedStyle : lockedStyle} ${adiamantado ? adiamantadoStyle : ''}`;

  const content = (
    <div className="flex flex-col p-5 flex-grow">
      {iconUrl && (
        <img src={iconUrl} alt="" className="w-12 h-12 mb-4 object-contain self-start" />
      )}
      <h3 className="text-xl font-semibold text-brand-blue mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>

      {adiamantado && (
        <span className="bg-cyan-400 text-white text-xs font-bold py-1 px-3 rounded-full self-start shadow-md">
          Adiamantado
        </span>
      )}
    </div>
  );

  return isUnlocked ? (
    <Link to={`/modules/${id}`} className={cardClasses}>    
      {content}
    </Link>
  ) : (
    <div className={cardClasses}>
      {content}
    </div>
  );
};

export default ModuleCard;
