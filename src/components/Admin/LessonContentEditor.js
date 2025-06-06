// src/components/Admin/LessonContentEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TextItemForm from './TextItemForm';
import QuestionItemForm from './QuestionItemForm';
import ImageContentForm from './ImageContentForm';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// --- Subcomponente ContentItem Estilizado ---
const ContentItem = ({ item, index, onEdit, onDelete }) => {
  return (
    <div className="bg-neutral-white border border-neutral-medium rounded-xl shadow-lg hover:shadow-xl p-4 mb-4 relative group transition-all duration-200 ease-in-out">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2 z-10">
        <button
          onClick={() => onEdit(index)}
          className="text-xs font-medium bg-accent-orange hover:bg-orange-600 text-white py-1.5 px-3 rounded-md shadow-md hover:shadow-lg transition-all"
          title="Editar Item"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(index)}
          className="text-xs font-medium bg-accent-red hover:bg-red-700 text-white py-1.5 px-3 rounded-md shadow-md hover:shadow-lg transition-all"
          title="Eliminar Item"
        >
          Eliminar
        </button>
      </div>

      <p className="text-xs text-text-secondary mb-2">
        Orden: {item.order ?? index} - Tipo: <span className="font-semibold text-brand-blue">{item.type}</span>
      </p>

      {item.type === 'text' && (
        <div className="prose prose-sm max-w-none break-words text-text-primary">
          <p>{item.value?.substring(0, 250)}{item.value?.length > 250 ? '...' : ''}</p>
        </div>
      )}
      {item.type === 'image' && (
        <div>
          <img
            src={item.url}
            alt={item.caption || `Imagen ${index + 1}`}
            className="mt-1 max-w-full sm:max-w-md md:max-w-lg max-h-60 object-contain border-2 border-neutral-medium rounded-lg bg-gray-50"
          />
          {item.caption && <p className="text-xs text-text-secondary mt-1.5 italic">{item.caption}</p>}
        </div>
      )}
      {item.type === 'question' && (
        <div className="mt-1 space-y-1 text-sm text-text-primary">
          <p><strong className="font-semibold text-text-primary">P:</strong> {item.value}</p>
          <p><strong className="font-semibold text-brand-green">R:</strong> <span className="text-brand-green">{item.answer}</span></p>
          {item.options && Array.isArray(item.options) && <p><strong className="font-semibold text-text-secondary">Opc:</strong> <span className="text-text-secondary">{item.options.join(' | ')}</span></p>}
          {item.explanation && <p className="text-xs text-text-secondary"><strong className="font-semibold">Exp:</strong> {item.explanation}</p>}
          <p className="text-xs text-text-secondary"><strong className="font-semibold">Pts:</strong> {item.points ?? 0}</p>
          {/* ID de Pregunta puede ser útil para depuración, opcional mantenerlo visible para admin */}
          {/* <p className="text-xs text-neutral-dark">ID Pregunta: {item.id || 'No asignado'}</p> */}
        </div>
      )}
    </div>
  );
};

const LessonContentEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [addingItemType, setAddingItemType] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  // --- LÓGICA FUNCIONAL (SIN CAMBIOS RESPECTO A TU CÓDIGO ORIGINAL) ---
  useEffect(() => {
    if (!lessonId) {
      setError("No se proporcionó ID de lección.");
      setLoading(false);
      return;
    }
    const fetchLesson = async () => {
      setLoading(true); setError(null);
      try {
        const lessonDocRef = doc(db, 'lessons', lessonId);
        const docSnap = await getDoc(lessonDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const contentWithTempIds = (data.content || []).map((item, index) => ({
            ...item,
            tempId: item.tempId || `loaded_${Date.now()}_${index}`,
            order: item.order ?? index,
          }));
          setLessonData({ id: docSnap.id, ...data, content: contentWithTempIds });
        } else {
          setError("Lección no encontrada."); setLessonData(null);
        }
      } catch (err) {
        setError("Error al cargar datos de la lección."); setLessonData(null);
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const showAddForm = addingItemType !== null;
  const showEditForm = editingItemIndex !== null;

  const initialEditData = showEditForm && lessonData && lessonData.content[editingItemIndex]
    ? lessonData.content[editingItemIndex]
    : null;

  const formType = showAddForm ? addingItemType : (showEditForm && initialEditData ? initialEditData.type : null);

  const handleAddItemSubmit = useCallback((newItemDataFromForm) => {
    if (!lessonData || !addingItemType) {
      console.error("No se puede añadir item: lessonData no cargado o addingItemType no definido.");
      return;
    }
    const newOrder = lessonData.content?.length || 0;
    const newItem = {
      ...newItemDataFromForm,
      type: addingItemType,
      order: newOrder,
      tempId: `new_${Date.now()}_${Math.random()}`
    };
    if (newItem.type === 'question' && !newItem.id) {
        newItem.id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    setLessonData(prev => ({
      ...prev,
      content: [...(prev.content || []), newItem]
    }));
    setAddingItemType(null);
    toast.success(`Elemento de ${addingItemType} añadido localmente.`);
  }, [lessonData, addingItemType]);

  const handleEditItemSubmit = useCallback((indexToUpdate, updatedItemDataFromForm) => {
    if (!lessonData || lessonData.content[indexToUpdate] === undefined) {
      console.error("No se puede editar item: lessonData no cargado o índice inválido.");
      return;
    }
    const itemToEdit = lessonData.content[indexToUpdate];
    const updatedItem = {
      ...itemToEdit,
      ...updatedItemDataFromForm
    };
    setLessonData(prev => ({
      ...prev,
      content: prev.content.map((item, index) =>
        index === indexToUpdate ? updatedItem : item
      )
    }));
    setEditingItemIndex(null);
    toast.success(`Elemento #${indexToUpdate + 1} actualizado localmente.`);
  }, [lessonData]);

  const handleEditClick = useCallback((indexToEdit) => {
    if (lessonData && lessonData.content[indexToEdit]) {
      setAddingItemType(null);
      setEditingItemIndex(indexToEdit);
    }
  }, [lessonData]);

  const handleCancelForm = useCallback(() => {
    setAddingItemType(null);
    setEditingItemIndex(null);
  }, []);

  const handleDeleteItem = useCallback((indexToDelete) => {
    if (!lessonData || !window.confirm(`¿Seguro que quieres eliminar el elemento #${indexToDelete + 1}?`)) return;
    const updatedContent = lessonData.content
        .filter((_, index) => index !== indexToDelete)
        .map((item, newIndex) => ({ ...item, order: newIndex }));
    setLessonData(prev => ({ ...prev, content: updatedContent }));
    toast.success(`Elemento #${indexToDelete + 1} eliminado localmente.`);
  }, [lessonData]);

  const handleSaveChanges = useCallback(async () => {
    if (!window.confirm("¿Deseas guardar todos los cambios en esta lección?")) return;
    if (!lessonData || !lessonId || !Array.isArray(lessonData.content)) {
      toast.error("Error: Faltan datos o el contenido no es válido.");
      return;
    }
    setIsSaving(true); setError(null);
    try {
      const lessonDocRef = doc(db, 'lessons', lessonId);
      const contentToSave = lessonData.content.map(({ tempId, ...rest }) => rest);
      await updateDoc(lessonDocRef, { content: contentToSave });
      toast.success("¡Contenido de la lección guardado en Firestore!");
    } catch (err) {
      setError("Error al guardar los cambios.");
      toast.error("Error al guardar en Firestore.");
      console.error("Error saving changes:", err);
    } finally {
      setIsSaving(false);
    }
  }, [lessonData, lessonId]);
  // --- FIN DE LÓGICA FUNCIONAL ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-light">
        <p className="text-text-secondary text-lg">Cargando editor de lección...</p>
      </div>
    );
  }

  if (error && !lessonData) { // Si hay error y no hay datos de lección, error crítico
    return (
      <div className="min-h-screen bg-neutral-light p-6">
        <div className="container mx-auto text-center">
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-accent-red text-accent-red rounded-md shadow-sm inline-block" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <div className="mt-4">
            {/* Intenta ir a la página de lecciones del nivel si es posible, sino a la de módulos */}
            <Link 
              to={lessonData?.levelId ? `/admin/levels/${lessonData.levelId}/lessons` : (lessonData?.moduleId ? `/admin/modules/${lessonData.moduleId}/levels` : '/admin/modules')} 
              className="text-brand-blue hover:text-blue-700 underline font-medium transition-colors duration-150"
            >
              Volver a la página anterior
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!lessonData) { // Si no hay error pero tampoco datos (ej. lección no existe pero no lanzó error de fetch)
      return (
        <div className="flex justify-center items-center min-h-screen bg-neutral-light">
          <p className="text-text-secondary text-lg">Lección no encontrada o datos no cargados.</p>
        </div>
      );
  }


  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate(lessonData?.levelId ? `/admin/levels/${lessonData.levelId}/lessons` : '/admin/modules')} 
                className="text-brand-blue hover:text-blue-700 transition-colors duration-200 ease-in-out text-sm font-medium inline-flex items-center mb-4 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-0.5 transition-transform">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
          </svg>
          Volver a Lista de Lecciones
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-6 border-b-2 border-neutral-medium pb-3">
          Editando Contenido: <span className="text-accent-orange">{lessonData.title || 'Lección Sin Título'}</span>
        </h1>

        <div className="mb-8 p-4 md:p-6 bg-neutral-white border border-neutral-medium rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-brand-blue">Metadatos de la Lección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <p><strong className="font-medium text-text-secondary">ID:</strong> <span className="text-text-primary">{lessonData.id}</span></p>
            <p><strong className="font-medium text-text-secondary">Orden:</strong> <span className="text-text-primary">{lessonData.order ?? 'No definido'}</span></p>
            <p><strong className="font-medium text-text-secondary">XP Puntos:</strong> <span className="text-text-primary">{lessonData.xpPoints ?? 0}</span></p>
            <p><strong className="font-medium text-text-secondary">Nivel ID:</strong> <span className="text-text-primary">{lessonData.levelId}</span></p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-brand-blue">Contenido Interactivo</h2>
        <div className="mb-6 border-t-2 border-neutral-medium pt-6">
          {Array.isArray(lessonData.content) && lessonData.content.length > 0 ? (
            lessonData.content.map((item, index) => (
              <ContentItem
                key={item.tempId || `item-${index}`}
                item={item}
                index={index}
                onEdit={handleEditClick}
                onDelete={handleDeleteItem}
              />
            ))
          ) : (
            <div className="py-10 text-center bg-neutral-white border-2 border-dashed border-neutral-medium rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-neutral-medium mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
                <p className="text-text-secondary text-lg font-medium">Esta lección aún no tiene contenido.</p>
                <p className="text-sm text-text-secondary">¡Comienza añadiendo elementos con los botones de abajo!</p>
            </div>
          )}
        </div>

        {(showAddForm || showEditForm) && (
          <div className="my-8 p-6 bg-neutral-white rounded-xl shadow-2xl border-2 border-brand-blue">
            <h3 className="text-xl font-semibold text-brand-blue mb-6 pb-3 border-b border-neutral-medium">
              {showEditForm ? `Editando Elemento #${editingItemIndex != null ? editingItemIndex + 1 : ''} (${initialEditData?.type || 'Desconocido'})` : `Añadiendo Nuevo Elemento de ${addingItemType || 'Desconocido'}`}
            </h3>
            {/* NOTA: Asegúrate que TextItemForm, ImageContentForm y QuestionItemForm estén estilizados internamente */}
            {formType === 'text' && (
              <TextItemForm
                onSubmit={showEditForm ? (data) => handleEditItemSubmit(editingItemIndex, data) : handleAddItemSubmit}
                onCancel={handleCancelForm}
                initialData={showEditForm ? initialEditData : { value: '' }}
              />
            )}
            {formType === 'image' && (
              <ImageContentForm
                onSubmit={showEditForm ? (data) => handleEditItemSubmit(editingItemIndex, data) : handleAddItemSubmit}
                onCancel={handleCancelForm}
                initialData={showEditForm ? initialEditData : { url: '', caption: '' }}
              />
            )}
            {formType === 'question' && (
              <QuestionItemForm
                onSubmit={showEditForm ? (data) => handleEditItemSubmit(editingItemIndex, data) : handleAddItemSubmit}
                onCancel={handleCancelForm}
                initialData={showEditForm ? initialEditData : undefined}
              />
            )}
          </div>
        )}

        {!showAddForm && !showEditForm && (
          <div className="mt-8 pt-6 border-t-2 border-neutral-medium">
              <h3 className="text-xl font-semibold mb-4 text-brand-blue">Añadir Nuevo Elemento:</h3>
              <div className="flex flex-wrap gap-3 md:gap-4">
                  <button
                      onClick={() => { setEditingItemIndex(null); setAddingItemType('text'); }}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-accent-orange rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-opacity-75 transition-all duration-200 ease-in-out transform active:scale-95"
                  >
                      Añadir Texto
                  </button>
                  <button
                      onClick={() => { setEditingItemIndex(null); setAddingItemType('image'); }}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-blue rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-75 transition-all duration-200 ease-in-out transform active:scale-95"
                  >
                      Añadir Imagen
                  </button>
                  <button
                      onClick={() => { setEditingItemIndex(null); setAddingItemType('question'); }}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-green rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-opacity-75 transition-all duration-200 ease-in-out transform active:scale-95"
                  >
                      Añadir Pregunta
                  </button>
              </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t-2 border-neutral-medium text-right">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || !lessonData?.content || lessonData.content.length === 0}
            className={`px-8 py-3 text-base font-bold text-white rounded-lg shadow-lg transition-all duration-200 ease-in-out transform active:scale-95
                        ${isSaving || !lessonData?.content || lessonData.content.length === 0
                          ? 'bg-neutral-medium cursor-not-allowed opacity-70'
                          : 'bg-brand-green hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75'}`}
          >
            {isSaving ? 'Guardando Contenido...' : 'Guardar Contenido de Lección'}
          </button>
          {error && lessonData && <p className="text-accent-red text-sm text-right mt-2">{error}</p>} {/* Mostrar error solo si hay datos de lección */}
        </div>
      </div>
    </div>
  );
};

export default LessonContentEditor;