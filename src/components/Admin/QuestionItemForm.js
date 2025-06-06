// src/components/Admin/QuestionItemForm.js
import React, { useState } from 'react';

const QuestionItemForm = ({ onSubmit, onCancel, initialData }) => {
  // Estado inicial con valores por defecto o los datos iniciales para edición
  const defaults = { value: '', answer: '', options: ['', '', '', ''], explanation: '', points: 10 };
  const [questionData, setQuestionData] = useState({ ...defaults, ...initialData });

  // Manejador genérico para inputs de texto/número
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setQuestionData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  // Manejador para cambiar una opción específica
  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones básicas
    if (!questionData.value.trim() || !questionData.answer.trim()) {
      alert("La pregunta y la respuesta correcta son obligatorias.");
      return;
    }
    const validOptions = questionData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
       alert("Debe haber al menos dos opciones válidas.");
       return;
    }
    // Validar que la respuesta correcta (sin espacios extra) esté en las opciones válidas
    if (!validOptions.map(opt => opt.trim()).includes(questionData.answer.trim())) {
        alert("La respuesta correcta debe ser una de las opciones proporcionadas (y coincidir exactamente).");
        return;
    }

    // Enviar datos (incluyendo el tipo y limpiando espacios)
    onSubmit({
        type: 'question', // <--- ¡AÑADIDO!
        value: questionData.value.trim(),
        answer: questionData.answer.trim(),
        options: validOptions.map(opt => opt.trim()), // Guardar opciones sin espacios extra
        explanation: questionData.explanation.trim(),
        points: questionData.points // Ya es un número
    });
};

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow my-4 space-y-3">
      <h3 className="text-lg font-semibold mb-3">Añadir/Editar Pregunta</h3>

      <div>
        <label htmlFor="q_value" className="block text-sm font-medium text-gray-700 mb-1">Pregunta:</label>
        <textarea id="q_value" name="value" value={questionData.value} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>

      {/* Opciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opciones (mínimo 2):</label>
        {questionData.options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Opción ${index + 1}`}
            className="w-full p-2 border rounded mb-1 text-sm"
          />
        ))}
         {/* Podríamos añadir botones para + / - opciones, pero empezamos con 4 fijas */}
      </div>

       <div>
        <label htmlFor="q_answer" className="block text-sm font-medium text-gray-700 mb-1">Respuesta Correcta:</label>
        <input type="text" id="q_answer" name="answer" value={questionData.answer} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Escribe la respuesta correcta EXACTAMENTE como en una de las opciones" />
      </div>

       <div>
        <label htmlFor="q_explanation" className="block text-sm font-medium text-gray-700 mb-1">Explicación:</label>
        <textarea id="q_explanation" name="explanation" value={questionData.explanation} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

       <div>
        <label htmlFor="q_points" className="block text-sm font-medium text-gray-700 mb-1">Puntos:</label>
        <input type="number" id="q_points" name="points" value={questionData.points} onChange={handleChange} required min="0" className="w-full p-2 border rounded" />
      </div>


      <div className="flex justify-end space-x-2 pt-3">
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm">
          Cancelar
        </button>
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm">
          Guardar Pregunta
        </button>
      </div>
    </form>
  );
};

export default QuestionItemForm;