/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Si tienes un archivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Busca en todos los archivos .js, .ts, .jsx y .tsx dentro de la carpeta src y sus subcarpetas
  ],
  theme: {
    extend: {
      colors: {
        // Colores de Marca (30%)
        'brand-blue': '#2196F3',    // Azul vibrante (confianza, enfoque)
        'brand-green': '#66BB6A',   // Verde refrescante (progreso, éxito)

        // Acentos "Dopamina" (10%)
        'accent-yellow': '#FFD700', // Amarillo brillante (optimismo, atención)
        'accent-orange': '#FFA726', // Naranja enérgico (acción, entusiasmo)
        'accent-red': '#F44336',    // Rojo dinámico (urgencia, empuje)

        // Neutros (60%) - Tailwind ya tiene buenos grises, pero puedes añadir específicos
        'neutral-white': '#FFFFFF',
        'neutral-light': '#F7FAFC', // Un gris muy claro, ejemplo
        'neutral-medium': '#E2E8F0', // Un gris claro, ejemplo
        'neutral-dark': '#A0AEC0',  // Un gris para texto secundario, ejemplo
        'text-primary': '#2D3748',   // Un gris oscuro para texto principal
        'text-secondary': '#718096', // Un gris más claro para texto secundario
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
