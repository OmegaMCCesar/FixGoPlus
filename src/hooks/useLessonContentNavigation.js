// src/hooks/useLessonContentNavigation.js
import { useState, useEffect, useCallback, useMemo } from 'react';

const useLessonContentNavigation = (currentLesson) => {
  const [sortedLessonContent, setSortedLessonContent] = useState([]);
  const [allQuestionsInLesson, setAllQuestionsInLesson] = useState([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [currentContentItem, setCurrentContentItem] = useState(null);

  // Efecto para procesar el contenido de la lección cuando currentLesson cambia
  useEffect(() => {
    if (currentLesson && currentLesson.content) {
      const content = (currentLesson.content || []).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      setSortedLessonContent(content);

      const questionsOnly = content.filter(item => item.type === 'question');
      setAllQuestionsInLesson(questionsOnly);

      setCurrentContentIndex(0); // Siempre empezar desde el primer ítem

      if (content.length > 0) {
        setCurrentContentItem(content[0]);
      } else {
        setCurrentContentItem(null);
      }
    } else {
      // Si no hay currentLesson o no tiene contenido, reseteamos
      setSortedLessonContent([]);
      setAllQuestionsInLesson([]);
      setCurrentContentIndex(0);
      setCurrentContentItem(null);
    }
  }, [currentLesson]); // Se ejecuta cuando currentLesson (el objeto completo) cambia

  // Efecto para actualizar el currentContentItem cuando el índice o el contenido ordenado cambian
  useEffect(() => {
    if (sortedLessonContent.length > 0 && currentContentIndex < sortedLessonContent.length) {
      setCurrentContentItem(sortedLessonContent[currentContentIndex]);
    } else if (sortedLessonContent.length > 0 && currentContentIndex >= sortedLessonContent.length) {
      // Se ha llegado al final del contenido, currentContentItem se vuelve null
      setCurrentContentItem(null);
    } else if (sortedLessonContent.length === 0) {
      setCurrentContentItem(null);
    }
  }, [currentContentIndex, sortedLessonContent]);

  // Función para avanzar al siguiente elemento de contenido
  const advanceToNextContentItem = useCallback(() => {
    // No llamaremos a completeLevel() aquí directamente.
    // LessonPage decidirá cuándo llamar a completeLevel basado en si se ha llegado al final.
    if (currentContentIndex < sortedLessonContent.length - 1) {
      setCurrentContentIndex(prev => prev + 1);
    } else {
      // Si ya está en el último o más allá, indicamos que no hay más (currentContentIndex no cambiará o setCurrentContentItem será null)
      // La llamada a completeLevel() se manejará en LessonPage cuando detecte que currentContentItem es null
      // o que currentContentIndex ha alcanzado sortedLessonContent.length
      setCurrentContentIndex(prev => prev + 1); // Permite que currentContentIndex supere la longitud para indicar el final
      console.log("useLessonContentNavigation: Se alcanzó el final del contenido.");
    }
  }, [currentContentIndex, sortedLessonContent.length]);


  const totalContentItems = useMemo(() => sortedLessonContent.length, [sortedLessonContent]);
  const currentContentDisplayIndex = useMemo(() => Math.min(currentContentIndex + 1, totalContentItems), [currentContentIndex, totalContentItems]);
  const isLastContentItem = useMemo(() => currentContentIndex >= totalContentItems - 1 && totalContentItems > 0, [currentContentIndex, totalContentItems]);
  const hasReachedEnd = useMemo(() => currentContentIndex >= totalContentItems && totalContentItems > 0, [currentContentIndex, totalContentItems]);


  return {
    currentContentItem,          // El objeto del ítem actual (texto, imagen, pregunta)
    advanceToNextContentItem,    // Función para ir al siguiente ítem
    allQuestionsInLesson,        // Array de solo los ítems de tipo 'question'
    currentContentDisplayIndex,  // Índice para mostrar al usuario (ej. "Elemento 1 de 5")
    totalContentItems,           // Número total de ítems de contenido en la lección
    isLastContentItem,           // Booleano: true si el ítem actual es el último
    hasReachedEnd,               // Booleano: true si el índice ya superó el último ítem
    isLoadingContent: !currentLesson || !currentLesson.content, // Indicador simple de carga
  };
};

export default useLessonContentNavigation;