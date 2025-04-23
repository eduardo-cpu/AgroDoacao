import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmService } from '../../firebase/farmService';
import { productService } from '../../firebase/productService';
import { useAuth } from '../../contexts/AuthContext';
import './styles/FarmPage.css';

const MyFarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmProductCounts, setFarmProductCounts] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Efeito para carregar as fazendas do proprietário atual
  useEffect(() => {
    const loadFarms = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const farmsList = await farmService.getFarmsByOwnerId(currentUser.uid);
        setFarms(farmsList);

        // Carregar contagem de produtos para cada fazenda
        const productCountsObj = {};
        for (const farm of farmsList) {
          try {
            const products = await productService.getProductsByFarmId(farm.id);
            productCountsObj[farm.id] = products.length;
          } catch (err) {
            console.error(`Erro ao buscar produtos da fazenda ${farm.id}:`, err);
            productCountsObj[farm.id] = 0;
          }
        }
        setFarmProductCounts(productCountsObj);
      } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
        setError('Não foi possível carregar suas fazendas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadFarms();
  }, [currentUser, navigate]);

  // Função para excluir uma fazenda
  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Tem certeza que deseja excluir esta fazenda? Esta ação não pode ser desfeita.')) {
      try {
        await farmService.deleteFarm(farmId);
        setFarms(farms.filter(farm => farm.id !== farmId));
      } catch (err) {
        console.error('Erro ao excluir fazenda:', err);
        alert('Não foi possível excluir a fazenda. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <main className="bg-background-light min-h-screen">
      <div className="relative h-[250px] flex items-end bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Minhas Fazendas</h1>
          <p className="text-white text-lg max-w-3xl">
            Gerencie todas as suas fazendas e os produtos disponíveis para doação.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="max-w-3xl">
            <p className="text-gray-700">
              Aqui você pode gerenciar todas as suas fazendas, adicionar novas, editar informações e gerenciar os produtos disponíveis para doação.
            </p>
          </div>
          <Link 
            to="/farm/new" 
            className="bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg"
          >
            + Adicionar Nova Fazenda
          </Link>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p>{error}</p>
        </div>}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
            <span className="ml-3 text-gray-600">Carregando suas fazendas...</span>
          </div>
        ) : farms.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-md text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhuma fazenda cadastrada</h3>
            <p className="mt-2 text-gray-500">Você ainda não possui fazendas cadastradas. Adicione sua primeira fazenda para começar.</p>
            <Link 
              to="/farm/new" 
              className="mt-6 inline-block bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg"
            >
              Cadastrar Minha Primeira Fazenda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map(farm => (
              <div key={farm.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={farm.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} 
                    alt={farm.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white">{farm.name}</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {farmProductCounts[farm.id] || 0} Produtos disponíveis
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-700"><span className="font-medium">Localização:</span> {farm.location}</p>
                    {farm.contactPhone && <p className="text-gray-700"><span className="font-medium">Telefone:</span> {farm.contactPhone}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Link 
                      to={`/farm/${farm.id}/products`}
                      className="bg-primary-green hover:bg-green-800 text-white py-2 px-4 rounded-lg font-medium transition text-center"
                    >
                      Ver Produtos
                    </Link>
                    <Link 
                      to={`/farm/${farm.id}/edit`}
                      className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg font-medium transition text-center"
                    >
                      Editar
                    </Link>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Link 
                      to={`/farm/${farm.id}/product/new`}
                      className="text-primary-green hover:text-green-800 text-sm font-medium"
                    >
                      + Adicionar Produto
                    </Link>
                    
                    <button 
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => handleDeleteFarm(farm.id)}
                    >
                      Excluir Fazenda
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyFarmsPage;