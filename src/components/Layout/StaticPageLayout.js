// src/components/Layout/StaticPageLayout.js (o donde prefieras)
import React from 'react';
import Navbar from '../Navigation/Navbar'; // Ajusta la ruta
import Footer from '../Navigation/Footer';   // Ajusta la ruta

const StaticPageLayout = ({ pageTitle, children }) => {
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-neutral-white p-6 md:p-10 rounded-2xl shadow-xl border border-neutral-medium max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-8 text-center">
            {pageTitle}
          </h1>
          {/* Aplicaremos la clase 'prose' para estilos de tipografía agradables */}
          <div className="prose prose-lg max-w-none 
                        prose-headings:text-brand-blue prose-headings:font-semibold
                        prose-p:text-text-primary prose-p:leading-relaxed
                        prose-a:text-brand-blue prose-a:font-medium hover:prose-a:text-accent-orange hover:prose-a:underline
                        prose-strong:text-text-primary prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:pl-5 prose-li:text-text-primary
                        prose-ol:list-decimal prose-ol:pl-5 prose-li:text-text-primary">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaticPageLayout;