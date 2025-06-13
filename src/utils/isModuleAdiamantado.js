// src/utils/isModuleAdiamantado.js
export const isModuleAdiamantado = (levels = [], adiamantadas = {}) => {
  return levels.length > 0 && levels.every(level => adiamantadas[`nivel-${level.id}`]);
};
