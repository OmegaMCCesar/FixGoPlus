// src/components/Lesson/QuestionDisplay.js
import React from 'react';

const QuestionDisplay = ({ question, userAnswer, setUserAnswer, handleAnswerSubmit }) => {
  return (
    <div className="bg-neutral-white rounded-xl shadow-xl border border-neutral-medium p-6 md:p-8 mb-6">
      <h2 className="text-brand-blue text-xl md:text-2xl font-bold mb-4">
        Pregunta:
      </h2>
      <p className="text-text-primary text-base md:text-lg mb-6 leading-relaxed">
        {question?.value || 'Cargando pregunta...'}
      </p>

      {question?.options && Array.isArray(question.options) && question.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {question.options.map((option, index) => {
            const isSelected = userAnswer === option;
            return (
              <button
                key={index}
                className={`w-full py-3.5 px-4 rounded-lg text-sm md:text-base font-semibold focus:outline-none border-2
                            transition-all duration-150 ease-in-out transform hover:scale-[1.02] active:scale-95
                            ${
                              isSelected
                                ? 'bg-brand-blue border-brand-blue text-neutral-white shadow-lg scale-[1.03]' // Estilo para opción seleccionada
                                : 'bg-neutral-white border-neutral-medium text-text-primary hover:bg-neutral-light hover:border-brand-blue' // Estilo para opción no seleccionada
                            }`}
                onClick={() => setUserAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Si no hay opciones, podrías tener un input de texto aquí para preguntas abiertas */}
      {/* Ejemplo:
      {!question?.options && question?.type === 'open_text' && (
        <textarea
          className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm mb-6"
          rows="3"
          placeholder="Escribe tu respuesta aquí..."
          value={userAnswer} // Asumiendo que userAnswer puede ser un string para este tipo
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      )}
      */}

      <button
        className={`w-full md:w-auto inline-flex justify-center items-center font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg 
                    mt-6 transition-all duration-150 ease-in-out transform active:scale-95 
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      !userAnswer
                        ? 'bg-neutral-medium text-text-secondary cursor-not-allowed' // Estilo deshabilitado
                        : 'bg-brand-green hover:bg-green-700 text-neutral-white focus:ring-brand-green' // Estilo habilitado
                    }`}
        onClick={handleAnswerSubmit}
        disabled={!userAnswer} // Deshabilitado si no hay respuesta (o si userAnswer es un string vacío para preguntas abiertas)
      >
        Enviar Respuesta
      </button>
    </div>
  );
};

export default QuestionDisplay;