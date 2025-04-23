import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { farmService } from '../../firebase/farmService';
import { productService } from '../../firebase/productService';
import { useAuth } from '../../contexts/AuthContext';
import './styles/FarmPage.css';

const FarmProductsPage = () => {
  const { farmId } = useParams();
  const [farm, setFarm] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Carregar dados da fazenda e seus produtos
  useEffect(() => {
    const loadFarmAndProducts = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Carregar dados da fazenda
        const farmData = await farmService.getFarmById(farmId);
        
        // Verificar se a fazenda pertence ao usuário atual
        if (farmData.ownerId !== currentUser.uid) {
          navigate('/my-farms');
          return;
        }
        
        setFarm(farmData);
        
        // Carregar produtos da fazenda
        const productsData = await productService.getProductsByFarmId(farmId);
        setProducts(productsData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados da fazenda e produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadFarmAndProducts();
  }, [farmId, currentUser, navigate]);

  // Função para excluir um produto
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
        alert('Não foi possível excluir o produto. Tente novamente mais tarde.');
      }
    }
  };

  // Função para calcular dias até a expiração
  const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <main className="bg-background-light min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-10">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/my-farms')}
              className="mt-3 bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
            >
              Voltar para Minhas Fazendas
            </button>
          </div>
        </div>
      ) : farm ? (
        <>
          <div className="relative h-[250px] flex items-end bg-cover bg-center" style={{
            backgroundImage: farm.image 
              ? `url('${farm.image}')`
              : "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="container mx-auto px-4 relative z-10 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{farm.name}</h1>
                  <p className="text-white text-lg max-w-3xl">
                    Produtos disponíveis para doação em sua fazenda
                  </p>
                </div>
                <Link 
                  to="/my-farms"
                  className="bg-white hover:bg-gray-100 text-primary-green py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg hidden md:block"
                >
                  Voltar para Minhas Fazendas
                </Link>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="md:hidden mb-6">
              <Link 
                to="/my-farms"
                className="bg-white hover:bg-gray-100 text-primary-green py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg inline-block"
              >
                Voltar para Minhas Fazendas
              </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="max-w-3xl">
                <p className="text-gray-700">
                  Gerencie os produtos disponíveis para doação em <span className="font-semibold">{farm.name}</span>. 
                  Adicione novos produtos ou edite os existentes.
                </p>
              </div>
              <Link 
                to={`/farm/${farmId}/product/new`} 
                className="bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                + Adicionar Novo Produto
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow-md text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum produto cadastrado</h3>
                <p className="mt-2 text-gray-500">Esta fazenda ainda não possui produtos disponíveis para doação.</p>
                <Link 
                  to={`/farm/${farmId}/product/new`}
                  className="mt-6 inline-block bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  Cadastrar Primeiro Produto
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition border border-gray-200">
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={product.image?.url || product.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`} 
                        alt={product.name}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs py-1 px-3 rounded-full font-semibold">
                        {daysUntilExpiry(product.expiryDate)} dias restantes
                      </div>
                      {product.category && (
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs py-1 px-3 rounded-full">
                          {product.category}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-primary-green mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="space-y-1 mb-4 text-sm">
                        <p><span className="font-medium">Quantidade:</span> {product.quantity}</p>
                        <p>
                          <span className="font-medium">Validade:</span> {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p><span className="font-medium">Localização:</span> {product.location}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Link 
                          to={`/farm/${farmId}/product/${product.id}/edit`}
                          className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg font-medium transition text-center"
                        >
                          Editar
                        </Link>
                        <button 
                          className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded-lg font-medium transition text-center"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Excluir
                        </button>
                      </div>
                      
                      {!product.isAvailable && (
                        <div className="mt-3 text-center">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            Produto não disponível
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="container mx-auto px-4 py-10">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
            <p>Fazenda não encontrada ou você não tem permissão para acessá-la.</p>
            <button 
              onClick={() => navigate('/my-farms')}
              className="mt-3 bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-4 rounded"
            >
              Voltar para Minhas Fazendas
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default FarmProductsPage;