// src/components/Admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
// Opcional: Importar íconos. Si los usas, asegúrate que su color contraste bien.
// import { FolderOpenIcon, UsersIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const adminActions = [
    {
      title: 'Gestionar Módulos',
      description: 'Crear, editar y organizar los módulos de aprendizaje, sus niveles y lecciones.',
      link: '/admin/modules',
      // icon: <FolderOpenIcon className="h-12 w-12 text-white opacity-80 mb-3" />, // Ejemplo con ícono
      icon: null,
      baseColorClass: 'bg-brand-blue',     // Azul vibrante para la base
      hoverColorClass: 'hover:bg-blue-700', // Un azul más oscuro para el hover (Tailwind shade)
      accentColorClass: 'bg-blue-700'       // Para el elemento decorativo
    },
    // EJEMPLOS DE FUTURAS TARJETAS CON LA NUEVA PALETA:
    // {
    //   title: 'Gestionar Usuarios',
    //   description: 'Ver y administrar los usuarios registrados en la plataforma.',
    //   link: '/admin/users', 
    //   icon: <UsersIcon className="h-12 w-12 text-white opacity-80 mb-3" />,
    //   baseColorClass: 'bg-brand-green',   // Verde refrescante
    //   hoverColorClass: 'hover:bg-green-700',
    //   accentColorClass: 'bg-green-700'
    // },
    // {
    //   title: 'Configuración General',
    //   description: 'Ajustar parámetros y configuraciones globales de la aplicación.',
    //   link: '/admin/settings',
    //   icon: <Cog6ToothIcon className="h-12 w-12 text-text-primary opacity-80 mb-3" />, // Icono oscuro sobre naranja
    //   baseColorClass: 'bg-accent-orange', // Naranja enérgico como un CTA importante en el dashboard
    //   hoverColorClass: 'hover:bg-orange-600', // Un naranja más oscuro para el hover
    //   textColorClass: 'text-text-primary', // Texto oscuro para mejor contraste sobre naranja si es necesario
    //   accentColorClass: 'bg-orange-600'
    // },
  ];

  return (
    // 60% background neutro
    <div className="min-h-screen bg-neutral-light p-4 sm:p-6 md:p-8"> {/* Usando neutral-light */}
      <div className="container mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4"> {/* 'flex-wrap' y 'gap-4' para responsiveness */}
          <h1 className="text-3xl md:text-4xl font-bold text-brand-blue border-b-2 border-neutral-medium pb-3"> {/* 30% color de marca */}
            Panel de Administración
          </h1>
          <Link
            to='/'
            className="text-sm bg-neutral-white hover:bg-gray-50 text-brand-blue font-semibold py-2 px-4 border border-brand-blue rounded-lg shadow-sm transition-colors duration-200 ease-in-out"
          >
            &larr; Volver al Sitio Principal
          </Link>
        </div>

        <p className="text-text-secondary mb-10 text-lg">
          Bienvenido. Desde aquí podrás gestionar el contenido y la estructura de la plataforma de aprendizaje.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {adminActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`
                block p-6 rounded-xl shadow-lg hover:shadow-xl 
                transform hover:-translate-y-1.5 transition-all duration-300 ease-in-out
                ${action.textColorClass || 'text-white'} overflow-hidden relative group 
                ${action.baseColorClass} ${action.hoverColorClass}
              `}
            >
              <div className="relative z-10">
                {action.icon && <div className="mb-3 flex justify-center sm:justify-start">{action.icon}</div>}
                <h2 className="text-2xl font-semibold mb-2 group-hover:underline">{action.title}</h2>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
              <div 
                className={`absolute top-0 right-0 h-28 w-28 ${action.accentColorClass} opacity-10 group-hover:opacity-20 rounded-full -mr-10 -mt-10 transition-all duration-300 transform group-hover:scale-125`}
              ></div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-neutral-white rounded-xl shadow-lg"> {/* Tarjeta neutral con más shadow */}
          <h2 className="text-xl font-semibold text-brand-blue mb-3">Información Adicional</h2> {/* Título con color de marca */}
          <p className="text-text-secondary">
            Asegúrate de revisar la estructura de los módulos y niveles antes de añadir nuevo contenido.
            La organización es clave para una buena experiencia de aprendizaje del usuario.
          </p>
          {/*
           <ul className="mt-4 list-disc list-inside text-text-secondary">
             <li>Revisar estadísticas de usuarios (próximamente).</li>
             <li>Verificar reportes de errores (próximamente).</li>
           </ul>
          */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;