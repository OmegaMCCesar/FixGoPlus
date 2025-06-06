// hooks/useLessonData.js
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const useLessonData = (levelId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const lessonsRef = collection(db, 'lessons');
        const q = query(lessonsRef, where('levelId', '==', levelId), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const lessonsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const questionsOnly = lessonsData.filter(lesson => lesson.content?.some(item => item.type === 'question'));
        setLessons(questionsOnly);
      } catch (error) {
        console.error('Error al cargar lecciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [levelId]);

  return { lessons, loading };
};

export default useLessonData;