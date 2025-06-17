import {Link} from 'react-router-dom';

const Ranking = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Ranking</h1>
            <p className="text-lg text-gray-600 mb-8">¡Pronto estará disponible!</p>
            <p className="text-sm text-gray-500 mt-4">Gracias por tu paciencia.</p> 
            <Link to="/" className="mt-6 bg-brand-blue text-white py-2 px-4 rounded-lg hover:bg-brand-blue-dark transition-colors">
                Volver al inicio
            </Link>  
        </div>
    )
}

export default Ranking;