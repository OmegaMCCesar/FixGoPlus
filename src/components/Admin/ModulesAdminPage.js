// src/components/Admin/ModulesAdminPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const modulesCollectionRef = collection(db, 'modules');

const ModulesAdminPage = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    iconUrl: '',
  });

  const fetchModules = useCallback(async () => {
    // console.log("fetchModules: Iniciando..."); // Mantén logs para depuración si es necesario
    setIsLoading(true);
    setError(null);
    try {
      const q = query(modulesCollectionRef, orderBy('order', 'asc'));
      const data = await getDocs(q);
      const fetchedModules = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setModules(fetchedModules);
    } catch (err) {
      console.error("fetchModules: Error al obtener módulos:", err);
      setError("Error al cargar los módulos.");
      // toast.error("No se pudieron cargar los módulos.");
    } finally {
      setIsLoading(false);
      // console.log("fetchModules: Finalizado. isLoading:", false);
    }
  }, []);

  useEffect(() => {
    // console.log("ModulesAdminPage: Montaje. Llamando a fetchModules.");
    fetchModules();
  }, [fetchModules]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', order: 0, iconUrl: '' });
    setCurrentModule(null);
    setShowForm(false);
  };

  const handleShowCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleShowEditForm = (moduleToEdit) => {
    setCurrentModule(moduleToEdit);
    setFormData({
      title: moduleToEdit.title || '',
      description: moduleToEdit.description || '',
      order: moduleToEdit.order || 0,
      iconUrl: moduleToEdit.iconUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.order < 0) {
      toast.error("El título es obligatorio y el orden debe ser un número no negativo.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const dataToSave = {
      ...formData,
      order: Number(formData.order),
      updatedAt: serverTimestamp(),
    };

    try {
      if (currentModule) {
        const moduleDoc = doc(db, 'modules', currentModule.id);
        await updateDoc(moduleDoc, dataToSave);
        toast.success(`Módulo "${formData.title}" actualizado!`);
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(modulesCollectionRef, dataToSave);
        toast.success(`Módulo "${formData.title}" creado!`);
      }
      resetForm();
      await fetchModules();
    } catch (err) {
      console.error("handleSubmitForm: Error al guardar módulo:", err);
      toast.error("Error al guardar el módulo.");
      setError("Error al guardar el módulo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el módulo "${moduleTitle}"? Esto podría afectar niveles y lecciones asociadas.`)) {
      setIsSubmitting(true);
      try {
        const moduleDoc = doc(db, 'modules', moduleId);
        await deleteDoc(moduleDoc);
        toast.success(`Módulo "${moduleTitle}" eliminado.`);
        await fetchModules();
      } catch (err) {
        // ... manejo de error ...
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading && modules.length === 0 && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-light">
        <p className="text-text-secondary text-lg">Cargando módulos...</p>
        {/* Aquí podrías poner un spinner animado */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light"> {/* Fondo general de la página */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6"> {/* Contenedor para el enlace de volver y título para alineación */}
            <Link to="/admin" className="text-brand-blue hover:text-blue-700 transition-colors duration-200 ease-in-out text-sm font-medium inline-flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
                </svg>
                Volver al Panel Principal
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue border-b-2 border-neutral-medium pb-3">
            Gestión de Módulos
            </h1>
        </div>

        {!showForm && (
          <button
            onClick={handleShowCreateForm}
            disabled={isSubmitting}
            // Botón CTA con Naranja Enérgico
            className="mb-8 flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-accent-orange rounded-lg shadow-md
                       hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-accent-orange 
                       focus:ring-opacity-75 transition-all duration-200 ease-in-out transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Crear Nuevo Módulo
          </button>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-neutral-white rounded-xl shadow-xl border border-neutral-medium"> {/* Formulario con más realce */}
            <h2 className="text-2xl font-semibold text-brand-blue mb-6 pb-3 border-b border-neutral-medium">
              {currentModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">Título del Módulo:</label>
                  <input
                    type="text" id="title" name="title" value={formData.title} onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm 
                               focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                               sm:text-sm text-text-primary placeholder-text-secondary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-text-primary mb-1">Orden Numérico:</label>
                  <input
                    type="number" id="order" name="order" value={formData.order} onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm 
                               focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                               sm:text-sm text-text-primary placeholder-text-secondary"
                    required min="0"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Descripción (Opcional):</label>
                <textarea
                  id="description" name="description" value={formData.description} onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm 
                             focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                             sm:text-sm text-text-primary placeholder-text-secondary"
                ></textarea>
              </div>
              <div>
                <label htmlFor="iconUrl" className="block text-sm font-medium text-text-primary mb-1">URL del Ícono (Opcional):</label>
                <input
                  type="url" id="iconUrl" name="iconUrl" value={formData.iconUrl} onChange={handleInputChange}
                  placeholder="https://ejemplo.com/icono.png"
                  className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm 
                             focus:ring-2 focus:ring-brand-blue focus:border-brand-blue 
                             sm:text-sm text-text-primary placeholder-text-secondary"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button" onClick={resetForm} disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-text-primary bg-neutral-medium 
                             hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 
                             rounded-lg shadow-sm transition-colors duration-200 ease-in-out disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  // Botón de guardado con Verde Refrescante
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-green 
                             hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green 
                             focus:ring-opacity-75 rounded-lg shadow-md transition-colors duration-200 ease-in-out 
                             transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : (currentModule ? 'Actualizar Módulo' : 'Crear Módulo')}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-accent-red text-accent-red rounded-md shadow-sm" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        
        <div className="bg-neutral-white shadow-xl rounded-xl overflow-hidden border border-neutral-medium"> {/* Tabla con más realce */}
          <table className="min-w-full divide-y divide-neutral-medium">
            <thead className="bg-gray-50"> {/* Un gris muy claro para el header de la tabla */}
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Orden</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider max-w-xs">Descripción</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-neutral-white divide-y divide-neutral-medium">
              {modules.length === 0 && !isLoading && !error && (
                <tr><td colSpan="4" className="px-6 py-16 text-center text-lg text-text-secondary">No hay módulos creados. ¡Crea el primero!</td></tr>
              )}
              {!error && modules.map((module) => (
                <tr key={module.id} className="hover:bg-neutral-light transition-colors duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{module.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{module.title}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary truncate max-w-xs">{module.description || <span className="italic">Sin descripción</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleShowEditForm(module)}
                      disabled={isSubmitting}
                      className="text-accent-orange hover:text-orange-700 font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar Módulo"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id, module.title)}
                      disabled={isSubmitting}
                      className="text-accent-red hover:text-red-700 font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar Módulo"
                    >
                      Eliminar
                    </button>
                    <Link
                      to={`/admin/modules/${module.id}/levels`}
                      className={`font-semibold text-brand-green hover:text-green-700 transition-colors duration-150 ${isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      title="Gestionar Niveles"
                    >
                      Niveles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && modules.length > 0 && !error && (
            <p className="text-center py-4 text-sm text-text-secondary italic">Actualizando lista de módulos...</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default ModulesAdminPage;