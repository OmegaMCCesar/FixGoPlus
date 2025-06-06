// src/components/Admin/ImageContentForm.js
import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast'; // Considerar para notificaciones en lugar de alert

const ImageContentForm = ({ onSubmit, onCancel, initialData = { url: '', caption: '' } }) => {
  const [url, setUrl] = useState(initialData.url);
  const [caption, setCaption] = useState(initialData.caption);

  useEffect(() => {
    setUrl(initialData.url || '');
    setCaption(initialData.caption || '');
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      // Considerar usar toast.error("Por favor, ingresa la URL de la imagen.") para consistencia;
      alert("Por favor, ingresa la URL de la imagen.");
      return;
    }
    onSubmit({ url: url.trim(), caption: caption.trim() });
  };

  return (
    // Fondo neutro para el formulario, con padding y sombra mejorada
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-neutral-white rounded-lg shadow-md">
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-text-primary mb-1">
          URL de la Imagen:
        </label>
        <input
          type="url"
          id="imageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          // Estilo de input con borde neutro y foco en color de marca (azul)
          className="w-full px-3 py-2 border border-neutral-medium rounded-md shadow-sm 
                     focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                     sm:text-sm text-text-primary placeholder-text-secondary"
          required
        />
        <p className="mt-1.5 text-xs text-text-secondary">
          Pega la URL completa de una imagen que ya esté alojada en internet.
        </p>
      </div>

      <div>
        <label htmlFor="imageCaption" className="block text-sm font-medium text-text-primary mb-1">
          Descripción de la Imagen (Caption):
        </label>
        <input
          type="text"
          id="imageCaption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Ej: Partes de un martillo (opcional)"
          // Mismos estilos de input que el campo URL
          className="w-full px-3 py-2 border border-neutral-medium rounded-md shadow-sm 
                     focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                     sm:text-sm text-text-primary placeholder-text-secondary"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-medium mt-6"> {/* Separador y más espacio superior para botones */}
        <button
          type="button"
          onClick={onCancel}
          // Botón secundario/neutral para cancelar
          className="px-4 py-2 text-sm font-medium text-text-primary bg-neutral-medium 
                     hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 
                     focus:ring-opacity-75 rounded-md shadow-sm transition-colors duration-200 ease-in-out"
        >
          Cancelar
        </button>
        <button
          type="submit"
          // Botón primario (constructivo/de guardado) usando brand-green
          className="px-4 py-2 text-sm font-medium text-white bg-brand-green 
                     hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green 
                     focus:ring-opacity-75 rounded-md shadow-sm transition-colors duration-200 ease-in-out"
        >
          {initialData.url ? 'Actualizar Imagen' : 'Añadir Imagen'}
        </button>
      </div>
    </form>
  );
};

export default ImageContentForm;