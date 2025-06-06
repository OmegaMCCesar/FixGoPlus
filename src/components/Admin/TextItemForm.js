// src/components/Admin/TextItemForm.js
import React, { useState } from 'react';

// Recibe onSubmit para enviar los datos y onCancel para cerrar
const TextItemForm = ({ onSubmit, onCancel, initialData = { value: '' } }) => {
  // Estado local para el valor del textarea
  const [textValue, setTextValue] = useState(initialData.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textValue.trim()) {
      alert("El texto no puede estar vacío."); // Validación simple
      return;
    }
    onSubmit({ value: textValue, type: 'text' }); // Llama a la función del padre con los datos
    setTextValue(''); // Limpia el form localmente (opcional)
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow my-4">
      <h3 className="text-lg font-semibold mb-3">Añadir/Editar Bloque de Texto</h3>
      <textarea
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        placeholder="Escribe el texto aquí..."
        required
        className="w-full p-2 border rounded mb-3 min-h-[100px]" // Textarea
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel} // Llama a la función del padre para cancelar
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
        >
          Guardar Texto
        </button>
      </div>
    </form>
  );
};

export default TextItemForm;