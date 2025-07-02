import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../components/Navigation/Navbar';
import { ReactComponent as TuerquitaLlenaIcon } from '../assets/icons/tuerquita-llenaa.svg';
import { ReactComponent as CheckmarkFeatureIcon } from '../assets/icons/xp-svgrepo-com.svg';

const stripePromise = loadStripe('pk_test_51RdwskGg3IjtOIDTcTLJkva3R3duP554TKKso2mbXhNKe6bqfGYvbmD2RqeF19YyJDmRr07C8ZSFdn0mBCb2DjD800oxnVrX4L'); // tu clave pública

// Mapea plan.id a Price ID de Stripe
const PRICE_IDS = {
  aprendiz_monthly: 'price_1RfsvmGg3IjtOIDTXjI32kGt',  // ⚠️ reemplaza con tus Price IDs reales
  tecnico_monthly: 'price_1RfsyfGg3IjtOIDTOVxXgPbs' // ⚠️ reemplaza con tus Price IDs reales
};

const StorePage = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleTuerquitaPurchase = async (pkg) => {
    setLoading(true);
    try {
      const resp = await fetch(
        'https://api-aaixedti3q-uc.a.run.app/create-stripe-tuerquitas-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tuerquitas: pkg.amount,
            userId: currentUser.uid
          })
        }
      );
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Unknown error');
    } catch (err) {
      alert('Error al iniciar pago: ' + err.message);
    }
    setLoading(false);
  };

  const handleSubscriptionPurchase = async (plan) => {
    setLoading(true);
    console.log('Iniciando compra de suscripción:', plan);
    
    const priceId = PRICE_IDS[plan.id];
    console.log(plan.name ,'name plan ');
    const planName = plan.name;
    
    if (!priceId) {
      alert('Plan no configurado correctamente');
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(
        'https://api-aaixedti3q-uc.a.run.app/create-stripe-subscription-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: priceId,
            userId: currentUser.uid,
            planName: planName
          })
        }
      );
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Unknown error');
    } catch (err) {
      alert('Error al iniciar suscripción: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light pb-16">
      <Navbar />
      <div className="container mx-auto mt-8 px-4 md:px-6">
        <h1 className="text-4xl font-extrabold text-brand-blue mb-8 text-center">
          Tienda FixGo
        </h1>

        {currentUser && (
          <div className="flex justify-center mb-10 p-4 bg-white rounded-xl shadow max-w-xs mx-auto">
            <span className="text-text-secondary mr-2">Tu Balance:</span>
            <TuerquitaLlenaIcon className="h-7 w-7 fill-accent-orange" />
            <span className="text-accent-orange font-bold text-2xl ml-1">
              {currentUser.tuerquitas ?? 0}
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-16 h-16"></div>
            <p className="text-lg ml-4">Redirigiendo a pasarela de pago...</p>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-brand-blue mb-8 text-center">
                Recarga tus Tuerquitas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 't10', name: 'Paquete Básico', amount: 10, price: '$10 MXN', icon: TuerquitaLlenaIcon },
                  { id: 't50', name: 'Paquete Impulso', amount: 50, price: '$15 MXN', icon: TuerquitaLlenaIcon },
                  { id: 't100', name: 'Kit Esencial', amount: 100, price: '$25 MXN', icon: TuerquitaLlenaIcon },
                  { id: 't250', name: 'Experto FixGo', amount: 250, price: '$50 MXN', icon: TuerquitaLlenaIcon },
                ].map(pkg => (
                  <div key={pkg.id} className="bg-white rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-xl font-semibold mb-3">{pkg.name}</h3>
                    <pkg.icon className="h-16 w-16 mb-2 fill-accent-orange mx-auto" />
                    <div className="flex items-baseline justify-center mb-1">
                      <span className="text-4xl font-extrabold text-accent-orange">{pkg.amount}</span>
                      <span className="text-lg text-accent-orange font-medium ml-1">Tuerquitas</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-blue mb-4">{pkg.price}</p>
                    <button
                      onClick={() => handleTuerquitaPurchase(pkg)}
                      className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                    >
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-brand-blue mb-8 text-center">
                Suscripciones PRO
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { id: 'aprendiz_monthly', name: 'Aprendiz PRO', price: '$49 MXN', features: ['Vidas Infinitas','Sin Anuncios','5 Tuerquitas Diarias'] },
                  { id: 'tecnico_monthly', name: 'Técnico PRO', price: '$99 MXN', features: ['Todo lo anterior + boost y descuentos'] }
                ].map(plan => (
                  <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <span className="text-4xl font-extrabold text-brand-blue">{plan.price}</span>
                    <ul className="space-y-2 my-4">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center">
                          <CheckmarkFeatureIcon className="h-5 w-5 mr-2 fill-brand-green"/>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscriptionPurchase(plan)}
                      className="w-full bg-brand-purple text-white font-bold py-3 rounded-lg hover:bg-purple-700"
                    >
                      Suscribirse
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default StorePage;
