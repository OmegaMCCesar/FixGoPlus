// src/pages/Static/TermsPage.js (o donde prefieras)
import React from 'react';
import StaticPageLayout from '../../components/Layout/StaticPageLayout'; // Ajusta la ruta

const TermsPage = () => {
  return (
    <StaticPageLayout pageTitle="Términos y Condiciones de Uso">
      {/* Aquí va tu contenido real. Este es un ejemplo de estructura: */}
      
      <p className="text-sm text-text-secondary mb-6">Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. Aceptación de los Términos</h2>
      <p>
        Bienvenido a FixGo (en adelante, "la Plataforma"). Al acceder o utilizar nuestra Plataforma, 
        aceptas estar sujeto a estos Términos y Condiciones de Uso ("Términos"). Si no estás de acuerdo 
        con alguna parte de los términos, no podrás acceder a la Plataforma.
      </p>

      <h2>2. Descripción del Servicio</h2>
      <p>
        FixGo es una plataforma educativa gamificada diseñada para ayudar a los usuarios a aprender sobre 
        [tu tema específico, ej: reparación de electrodomésticos, programación, etc.] a través de módulos interactivos, 
        niveles, lecciones y preguntas.
      </p>

      <h3>2.1. Cuentas de Usuario</h3>
      <p>
        Para acceder a ciertas funciones de la Plataforma, debes registrarte y crear una cuenta. Eres responsable 
        de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
        Aceptas notificar inmediatamente a FixGo sobre cualquier uso no autorizado de tu cuenta.
      </p>

      <h2>3. Uso de la Plataforma</h2>
      <p>Te comprometes a utilizar la Plataforma de acuerdo con todas las leyes y regulaciones aplicables y de una manera que no infrinja los derechos de terceros ni restrinja o inhiba el uso y disfrute de la Plataforma por parte de otros.</p>
      <ul>
        <li>No utilizarás la Plataforma para ningún propósito ilegal o no autorizado.</li>
        <li>No intentarás obtener acceso no autorizado a nuestros sistemas informáticos.</li>
        <li>No transmitirás gusanos, virus ni ningún código de naturaleza destructiva.</li>
      </ul>

      <h2>4. Propiedad Intelectual</h2>
      <p>
        Todo el contenido presente en la Plataforma, incluyendo pero no limitado a texto, gráficos, logotipos, 
        iconos, imágenes, clips de audio y video, compilaciones de datos y software, es propiedad de FixGo 
        o de sus licenciantes de contenido y está protegido por las leyes internacionales de derechos de autor.
      </p>

      <h2>5. Tuerquitas y Suscripciones (Si Aplica)</h2>
      <p>
        La Plataforma puede ofrecer bienes virtuales ("Tuerquitas") y planes de suscripción. Todas las compras 
        son finales y no reembolsables, excepto según lo exija la ley aplicable o se indique explícitamente 
        en nuestra política de reembolso. Los precios y la disponibilidad de Tuerquitas y suscripciones 
        están sujetos a cambios sin previo aviso.
      </p>
      
      {/* ... Continúa con más secciones según necesites ... */}
      {/* Por ejemplo:
          - Política de Privacidad (un breve resumen y enlace a la página completa)
          - Limitación de Responsabilidad
          - Modificaciones a los Términos
          - Ley Aplicable
          - Información de Contacto 
      */}

      <h2>6. Información de Contacto</h2>
      <p>
        Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en: 
        <a href="mailto:soporte@fixgoapp.com">soporte@fixgoapp.com</a>.
      </p>

    </StaticPageLayout>
  );
};

export default TermsPage;