import React, { useContext, useState } from 'react'; // Añadir useState
import { UserContext } from '../contexts/UserContext';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../components/Navigation/Navbar';
import { ReactComponent as TuerquitaLlenaIcon } from '../assets/icons/tuerquita-llenaa.svg';
import { ReactComponent as InfiniteIcon } from '../assets/icons/infinite-pictogram-svgrepo-com.svg';
import { ReactComponent as AdFreeIcon } from '../assets/icons/block-svgrepo-com.svg';
import { ReactComponent as XPMultiplierIcon } from '../assets/icons/xp-svgrepo-com.svg';
import { ReactComponent as CheckmarkFeatureIcon } from '../assets/icons/xp-svgrepo-com.svg'; // Asegúrate de tener este icono

const stripePromiseSk = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY_TEST);
const tuerquitaPackages = [

  { id: 't15', name: "Paquete Basico", amount: 10, price: '$10 MXN', pricePerUnit: '$0.31', cardStyle: "border-neutral-medium", buttonStyle: "bg-brand-blue hover:bg-blue-700", iconFill: "fill-accent-orange" },
  { id: 't50', name: "Paquete Impulso", amount: 50, price: '$15 MXN', pricePerUnit: '$0.30', cardStyle: "border-neutral-medium", buttonStyle: "bg-brand-blue hover:bg-blue-700", iconFill: "fill-accent-orange" },
  { id: 't100', name: "Kit Esencial", amount: 100, price: '$25 MXN', pricePerUnit: '$0.25', cardStyle: "border-accent-yellow ring-2 ring-accent-yellow scale-105", buttonStyle: "bg-accent-orange hover:bg-orange-600", iconFill: "fill-accent-orange", highlight: true, highlightText: '¡Recomendado!' },
  { id: 't250', name: "Experto FixGo", amount: 250, price: '$50 MXN', pricePerUnit: '$0.20', cardStyle: "border-brand-purple", buttonStyle: "bg-brand-purple hover:bg-purple-700", iconFill: "fill-accent-orange" },
];

const subscriptionPlans = [
    {
        id: 'aprendiz_monthly',
        name: 'Aprendiz FixGo',
        price: '$49 MXN',
        period: '/ mes',
        cardStyle: "border-brand-green",
        buttonStyle: "bg-brand-green hover:bg-green-700",
        features: [
            { text: 'Vidas Infinitas', icon: InfiniteIcon, iconColor: 'text-brand-purple' },
            { text: 'Sin Anuncios', icon: AdFreeIcon, iconColor: 'text-accent-red' },
            { text: '5 Tuerquitas Diarias', icon: TuerquitaLlenaIcon, iconColor: 'text-accent-orange' },
        ]
    },
    {
        id: 'tecnico_monthly',
        name: 'Técnico FixGo PRO',
        price: '$99 MXN',
        period: '/ mes',
        cardStyle: "border-brand-purple ring-2 ring-brand-purple scale-105", // Destacado premium
        buttonStyle: "bg-brand-purple hover:bg-purple-700",
        highlight: true,
        highlightText: '¡Más Valor!',
        features: [
            { text: 'Vidas Infinitas', icon: InfiniteIcon, iconColor: 'text-brand-purple' },
            { text: 'Sin Anuncios', icon: AdFreeIcon, iconColor: 'text-accent-red' },
            { text: '15 Tuerquitas Diarias', icon: TuerquitaLlenaIcon, iconColor: 'text-accent-orange' },
            { text: 'XP x1.5 Boost', icon: XPMultiplierIcon, iconColor: 'text-brand-green' },
            { text: 'Acceso Anticipado a Módulos', icon: CheckmarkFeatureIcon, iconColor: 'text-brand-green' },
            { text: '10% Descuento en Tuerquitas', icon: CheckmarkFeatureIcon, iconColor: 'text-brand-green' },
        ]
    }
]

const StorePage = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);  // Agregar estado para manejar el spinner de carga

  const handleTuerquitaPurchase = async (pkg) => {
    setLoading(true);  // Activar el spinner al hacer clic
    const stripe = await stripePromiseSk;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            name: pkg.name,
            price: parseFloat(pkg.price.replace('$', '').replace('MXN', '').trim()) * 100, // Convertir a centavos
            quantity: 1,
          },
        ],
      }),
    });

    const { sessionId } = await response.json();

    // Redirigir a la página de pago de Stripe
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Error al iniciar el pago:', error);
    }
    setLoading(false);  // Desactivar el spinner después de la redirección
  };

  const handleSubscriptionPurchase = async (plan) => {
    setLoading(true);  // Activar el spinner al hacer clic
    const stripe = await stripePromiseSk;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            name: plan.name,
            price: parseFloat(plan.price.replace('$', '').trim().replace('MXN', '')) * 100, // Convertir a centavos
            quantity: 1,
          },
        ],
      }),
    });

    const { sessionId } = await response.json();

    // Redirigir a la página de pago de Stripe
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Error al iniciar el pago:', error);
    }
    setLoading(false);  // Desactivar el spinner después de la redirección
  };

  return (
    <div className="min-h-screen bg-neutral-light pb-16">
      <Navbar />
      <div className="container mx-auto mt-8 px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue mb-8 md:mb-12 text-center tracking-tight">
          Tienda FixGo
        </h1>

        {currentUser && (
          <div className="flex items-center justify-center mb-10 md:mb-12 p-4 bg-neutral-white rounded-xl shadow-lg border border-neutral-medium max-w-xs mx-auto">
            <span className="text-text-secondary text-lg mr-2">Tu Balance:</span>
            <TuerquitaLlenaIcon className="h-7 w-7 fill-accent-orange" />
            <span className="text-accent-orange font-bold text-2xl ml-1">{currentUser.tuerquitas ?? 0}</span>
          </div>
        )}

        {/* Mostrar Spinner mientras carga */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-16 h-16"></div>
            <p className="text-lg ml-4">Redirigiendo a la pasarela de pago...</p>
          </div>
        ) : (
          <div>
            {/* Sección de Compra de Tuerquitas */}
            <section className="mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-8 text-center">
                Recarga tus Tuerquitas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
                {tuerquitaPackages.map((pkg) => (
                  <div key={pkg.id} className={`${pkg.cardStyle} bg-neutral-white rounded-2xl p-6 md:p-8 flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out relative`}>
                    {pkg.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-yellow text-neutral-dark text-xs font-bold py-1.5 px-4 rounded-full shadow-lg whitespace-nowrap">
                        {pkg.highlightText}
                      </div>
                    )}
                    <div className="pt-5 text-center flex-grow">
                      <h3 className="text-xl font-semibold text-text-primary mb-3">{pkg.name}</h3>
                      <TuerquitaLlenaIcon className={`h-16 w-16 mb-2 mx-auto ${pkg.iconFill}`} />
                      <div className="flex items-baseline justify-center mb-1">
                        <span className="text-4xl font-extrabold text-accent-orange">{pkg.amount}</span>
                        <span className="text-lg text-accent-orange font-medium ml-1">Tuerquitas</span>
                      </div>
                      <p className="text-2xl font-bold text-brand-blue mb-1.5">{pkg.price}</p>
                      <p className="text-xs text-text-secondary mb-6">(~{pkg.pricePerUnit} / tuerquita)</p>
                    </div>
                    <button
                      onClick={() => handleTuerquitaPurchase(pkg)}
                      className={`w-full ${pkg.buttonStyle} text-neutral-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform active:scale-95 mt-auto`}
                    >
                      Comprar Paquete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Sección de Suscripciones */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-8 text-center">
                Conviértete en PRO
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-stretch max-w-4xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className={`${plan.cardStyle} bg-neutral-white rounded-2xl p-6 md:p-8 flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out relative`}>
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-purple text-neutral-white text-xs font-bold py-1.5 px-4 rounded-full shadow-lg whitespace-nowrap">
                        {plan.highlightText}
                      </div>
                    )}
                    <div className="pt-5 text-center flex-grow">
                      <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                      <div className="mb-6">
                        <span className="text-4xl font-extrabold text-brand-blue">{plan.price}</span>
                        <span className="text-base text-text-secondary ml-1">{plan.period}</span>
                      </div>
                      <ul className="space-y-3 text-left mb-8 text-sm md:text-base">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-text-primary">
                            {feature.icon ? 
                              <feature.icon className={`h-5 w-5 mr-2.5 shrink-0 ${feature.iconColor || 'text-brand-green'}`} /> 
                              : <span className="h-5 w-5 mr-2.5 inline-block shrink-0"></span>}
                            <span>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => handleSubscriptionPurchase(plan)}
                      className={`w-full ${plan.buttonStyle} text-neutral-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform active:scale-95 mt-auto`}
                    >
                      Suscribirse Ahora
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
