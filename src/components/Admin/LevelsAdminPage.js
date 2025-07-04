// src/components/Admin/LevelsAdminPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const levelsCollectionRef = collection(db, 'levels');

const LevelsAdminPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    iconUrl: '',
  });

  const fetchModuleDetailsAndLevels = useCallback(async () => {
    if (!moduleId) {
      setError("No se proporcionó ID de módulo.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const moduleDocRef = doc(db, 'modules', moduleId);
      const moduleSnap = await getDoc(moduleDocRef);
      if (moduleSnap.exists()) {
        setModuleDetails({ id: moduleSnap.id, ...moduleSnap.data() });
      } else {
        throw new Error("Módulo padre no encontrado.");
      }

      const q = query(
        levelsCollectionRef,
        where('moduleId', '==', moduleId),
        orderBy('order', 'asc')
      );
      const data = await getDocs(q);
      const fetchedLevels = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setLevels(fetchedLevels);
      // console.log(`Workspaceed ${fetchedLevels.length} levels for moduleId: ${moduleId}`);
    } catch (err) {
      console.error("Error fetching module details or levels:", err);
      setError(err.message || "Error al cargar datos.");
      // Ya no usamos toast aquí si mostramos el error general.
      // toast.error(err.message || "No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModuleDetailsAndLevels();
  }, [fetchModuleDetailsAndLevels]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', order: 0, iconUrl: '' });
    setCurrentLevel(null);
    setShowForm(false);
  };

  const handleShowCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleShowEditForm = (levelToEdit) => {
    setCurrentLevel(levelToEdit);
    setFormData({
      title: levelToEdit.title || '',
      description: levelToEdit.description || '',
      order: levelToEdit.order || 0,
      iconUrl: levelToEdit.iconUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.order < 0) {
      toast.error("El título es obligatorio y el orden debe ser un número no negativo.");
      return;
    }
    if (!moduleId) {
      toast.error("Falta el ID del módulo padre.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const dataToSave = {
      ...formData,
      moduleId: moduleId,
      order: Number(formData.order),
      updatedAt: serverTimestamp(),
    };

    try {
      if (currentLevel) {
        const levelDoc = doc(db, 'levels', currentLevel.id);
        await updateDoc(levelDoc, dataToSave);
        toast.success(`Nivel "${formData.title}" actualizado!`);
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(levelsCollectionRef, dataToSave);
        toast.success(`Nivel "${formData.title}" creado!`);
      }
      resetForm();
      await fetchModuleDetailsAndLevels();
    } catch (err) {
      console.error("Error saving level:", err);
      toast.error("Error al guardar el nivel.");
      setError("Error al guardar el nivel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLevel = async (levelId, levelTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el nivel "${levelTitle}"? Esto podría afectar lecciones asociadas.`)) {
      setIsSubmitting(true);
      try {
        const levelDoc = doc(db, 'levels', levelId);
        await deleteDoc(levelDoc);
        toast.success(`Nivel "${levelTitle}" eliminado.`);
        await fetchModuleDetailsAndLevels();
      } catch (err) {
        console.error("Error deleting level:", err);
        toast.error("Error al eliminar el nivel.");
        setError("Error al eliminar el nivel.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-light">
        <p className="text-text-secondary text-lg">Cargando niveles...</p>
        {/* Aquí podrías poner un spinner animado */}
      </div>
    );
  }

  if (error && !moduleDetails) { // Si hay un error Y no se cargaron los detalles del módulo
    return (
      <div className="min-h-screen bg-neutral-light p-6">
        <div className="container mx-auto text-center"> {/* Centrado para el mensaje de error */}
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-accent-red text-accent-red rounded-md shadow-sm inline-block" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
            <div className="mt-4">
                <Link to="/admin/modules" className="text-brand-blue hover:text-blue-700 underline font-medium transition-colors duration-150">
                    Volver a la Gestión de Módulos
                </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/modules')}
            className="text-brand-blue hover:text-blue-700 transition-colors duration-200 ease-in-out text-sm font-medium inline-flex items-center mb-3 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-0.5 transition-transform">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
            </svg>
            Volver a Módulos
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-blue border-b-2 border-neutral-medium pb-3">
            Gestionar Niveles
          </h1>
          {moduleDetails && (
            <h2 className="text-xl font-semibold mt-2 text-accent-orange">
              para el Módulo: <span className="font-bold">{moduleDetails.title}</span>
            </h2>
          )}
        </div>

        {!showForm && (
          <button
            onClick={handleShowCreateForm}
            disabled={isSubmitting}
            className="mb-8 flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-accent-orange rounded-lg shadow-md
                       hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-accent-orange 
                       focus:ring-opacity-75 transition-all duration-200 ease-in-out transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
               <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Crear Nuevo Nivel
          </button>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-neutral-white rounded-xl shadow-xl border border-neutral-medium">
            <h2 className="text-2xl font-semibold text-brand-blue mb-6 pb-3 border-b border-neutral-medium">
              {currentLevel ? 'Editar Nivel' : `Crear Nivel para "${moduleDetails?.title || 'Módulo Desconocido'}"`}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">Título del Nivel:</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange}
                         className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-text-primary placeholder-text-secondary" required />
                </div>
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-text-primary mb-1">Orden Numérico:</label>
                  <input type="number" id="order" name="order" value={formData.order} onChange={handleInputChange}
                         className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-text-primary placeholder-text-secondary" required min="0"/>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Descripción (Opcional):</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4"
                          className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-text-primary placeholder-text-secondary"></textarea>
              </div>
              <div>
                <label htmlFor="iconUrl" className="block text-sm font-medium text-text-primary mb-1">URL del Ícono (Opcional):</label>
                <input type="url" id="iconUrl" name="iconUrl" value={formData.iconUrl} onChange={handleInputChange} placeholder="https://ejemplo.com/icono.png"
                       className="w-full px-3 py-2.5 border border-neutral-medium rounded-md shadow-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-text-primary placeholder-text-secondary"/>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={resetForm} disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-text-primary bg-neutral-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg shadow-sm transition-colors duration-200 ease-in-out disabled:opacity-60">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-opacity-75 rounded-lg shadow-md transition-colors duration-200 ease-in-out transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Guardando...' : (currentLevel ? 'Actualizar Nivel' : 'Crear Nivel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && moduleDetails && ( // Solo mostrar este error si los detalles del módulo se cargaron, para no duplicar
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-accent-red text-accent-red rounded-md shadow-sm" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="bg-neutral-white shadow-xl rounded-xl overflow-hidden border border-neutral-medium">
          <table className="min-w-full divide-y divide-neutral-medium">
            <thead className="bg-gray-50"> {/* Un gris muy claro para el header, o usa neutral-light */}
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Orden</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider max-w-xs">Descripción</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-neutral-white divide-y divide-neutral-medium">
              {levels.length === 0 && !isLoading && !error && (
                <tr><td colSpan="4" className="px-6 py-16 text-center text-lg text-text-secondary">No hay niveles creados para este módulo. ¡Crea el primero!</td></tr>
              )}
              {!error && levels.map((level) => (
                <tr key={level.id} className="hover:bg-neutral-light transition-colors duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{level.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{level.title}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary truncate max-w-xs">{level.description || <span className="italic">Sin descripción</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button onClick={() => handleShowEditForm(level)} disabled={isSubmitting}
                            className="font-semibold text-accent-orange hover:text-orange-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" title="Editar Nivel">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteLevel(level.id, level.title)} disabled={isSubmitting}
                            className="font-semibold text-accent-red hover:text-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" title="Eliminar Nivel">
                      Eliminar
                    </button>
                    <Link to={`/admin/levels/${level.id}/lessons`}
                          className={`font-semibold text-brand-green hover:text-green-700 transition-colors duration-150 ${isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} title="Gestionar Lecciones">
                      Lecciones
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && levels.length > 0 && !error && ( // Muestra solo si hay niveles cargados previamente y está recargando
            <p className="text-center py-4 text-sm text-text-secondary italic">Actualizando lista de niveles...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelsAdminPage;