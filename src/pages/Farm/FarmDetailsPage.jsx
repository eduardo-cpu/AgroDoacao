// filepath: /home/eduardosantossm/my-react-app/src/pages/Farm/FarmDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import farmService from '../../firebase/farmService';
import productService from '../../firebase/productService';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const FarmDetailsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState(null);
  const [products, setProducts] = useState([]);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const farmData = await farmService.getFarmById(id);
        if (farmData) {
          setFarm(farmData);
          const farmProducts = await productService.getProductsByFarm(id);
          setProducts(farmProducts);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da fazenda:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRequestProduct = (productId) => {
    alert(`Solicitação de coleta para o produto ID: ${productId} enviada! O produtor entrará em contato.`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mb-4"></div>
          <p className="text-gray-600">Carregando dados da fazenda...</p>
        </div>
      </div>
    );
  }
  
  if (!farm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md max-w-md mx-auto text-center">
          <p className="text-xl font-bold mb-2">Fazenda não encontrada</p>
          <p className="mb-4">A fazenda que você está procurando não existe ou foi removida.</p>
          <Link to="/farms" className="bg-primary-green hover:bg-green-800 text-white px-4 py-2 rounded-lg transition">
            Voltar para lista de fazendas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-background-light">
      <div className="relative w-full h-[400px] flex items-end" style={{
        backgroundImage: farm.imageUrl ? `url(${farm.imageUrl})` : 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <div className="container mx-auto px-4 relative z-20 mb-8">
          <Link to="/farms" className="inline-flex items-center text-white bg-black bg-opacity-30 hover:bg-opacity-50 px-4 py-2 rounded-full mb-4 transition">
            <span className="mr-2">←</span> Voltar para lista de fazendas
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white shadow-text">{farm.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 relative -mt-20 z-30 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-primary-green border-b-2 border-green-100 pb-2 mb-6 inline-block">
                Sobre a Fazenda
              </h2>
              <p className="text-gray-700 mb-6">{farm.description || 'Sem descrição disponível.'}</p>
              
              {farm.gallery && farm.gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {farm.gallery.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-md h-36 transition-transform hover:scale-105">
                      <img 
                        src={image} 
                        alt={`Imagem da ${farm.name} ${index + 1}`}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary-green border-b-2 border-green-100 pb-2 mb-6 inline-block">
                Localização e Detalhes para Coleta
              </h2>
              
              <div className="bg-white rounded-xl shadow-md border-t-4 border-primary-green p-6">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="font-semibold text-sm uppercase text-primary-green mb-1">Endereço:</p>
                  <p className="text-gray-700">{farm.address?.formattedAddress || farm.location || 'Endereço não informado.'}</p>
                </div>
                
                {farm.address && (
                  <div className="space-y-4">
                    {(farm.address.street || farm.address.streetNumber) && (
                      <div className="pb-4 border-b border-gray-100">
                        <p className="font-semibold text-sm uppercase text-primary-green mb-1">Rua/Número:</p>
                        <p className="text-gray-700">
                          {`${farm.address.street || ''}${farm.address.streetNumber ? ', ' + farm.address.streetNumber : ''}`}
                          {farm.address.complement ? ` - ${farm.address.complement}` : ''}
                        </p>
                      </div>
                    )}
                    
                    {farm.address.neighborhood && (
                      <div className="pb-4 border-b border-gray-100">
                        <p className="font-semibold text-sm uppercase text-primary-green mb-1">Bairro:</p>
                        <p className="text-gray-700">{farm.address.neighborhood}</p>
                      </div>
                    )}
                    
                    {(farm.address.city || farm.address.state) && (
                      <div className="pb-4 border-b border-gray-100">
                        <p className="font-semibold text-sm uppercase text-primary-green mb-1">Cidade/Estado:</p>
                        <p className="text-gray-700">
                          {`${farm.address.city || ''}${farm.address.state ? ' - ' + farm.address.state : ''}`}
                          {farm.address.postalCode ? `, CEP: ${farm.address.postalCode}` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {farm.locationDetails && (
                  <div className="pb-4 border-b border-gray-100">
                    <p className="font-semibold text-sm uppercase text-primary-green mb-1">Como Chegar:</p>
                    <p className="text-gray-700">{farm.locationDetails}</p>
                  </div>
                )}

                <div className="pb-4 border-b border-gray-100">
                  <p className="font-semibold text-sm uppercase text-primary-green mb-1">Contato:</p>
                  <p className="text-gray-700">{farm.contactName || farm.ownerName || ''} {farm.contactPhone || farm.ownerPhone || 'Telefone não informado'}</p>
                </div>

                <div className="pb-4 border-b border-gray-100">
                  <p className="font-semibold text-sm uppercase text-primary-green mb-1">Horários para Coleta:</p>
                  <p className="text-gray-700">{farm.preferredPickupTimes || 'Horários não especificados.'}</p>
                </div>
                
                <div className="mt-6 rounded-lg overflow-hidden shadow-sm">
                  {isLoaded && farm.coordinates ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={farm.coordinates}
                      zoom={13}
                      options={{ scrollwheel: false }}
                    >
                      <Marker position={farm.coordinates} />
                    </GoogleMap>
                  ) : loadError ? (
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 italic">
                      Erro ao carregar o mapa: {loadError.message}
                    </div>
                  ) : !farm.coordinates ? (
                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 italic">
                      Localização no mapa não disponível
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green mb-2"></div>
                        <p>Carregando mapa...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {farm.coordinates && (
                  <div className="mt-4 text-center">
                    <a 
                      href={`https://maps.google.com/?q=${farm.coordinates.lat},${farm.coordinates.lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-primary-green hover:bg-green-800 text-white px-6 py-2 rounded-full transition text-sm font-medium"
                    >
                      Ver no Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-primary-green border-b-2 border-green-100 pb-2 mb-4 inline-block">
              Produtos Disponíveis para Doação
            </h2>
            <p className="text-gray-600 mb-6">Confira abaixo os produtos disponíveis para doação nesta fazenda. Todos os itens foram verificados quanto à qualidade e estão em boas condições para consumo.</p>

            {products.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 italic">Não há produtos disponíveis para doação no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-card overflow-hidden border border-gray-200 transition hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {product.image ? (
                        <img 
                          src={product.image.url} 
                          alt={product.name}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 italic">
                          Sem imagem
                        </div>
                      )}
                      {product.expiryDate && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs py-1 px-3 rounded-full font-semibold">
                          {daysUntilExpiry(product.expiryDate)} dias restantes
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-primary-green mb-2">{product.name}</h3>
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm mb-2">{product.description || 'Sem descrição disponível.'}</p>
                        {product.quantity && (
                          <p className="text-sm">
                            <span className="font-semibold">Quantidade:</span> {product.quantity} {product.unit || 'kg'}
                          </p>
                        )}
                        {product.expiryDate && (
                          <p className="text-sm">
                            <span className="font-semibold">Validade:</span> {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        <div className="mt-3">
                          <span className={`inline-block text-xs font-semibold py-1 px-3 rounded-full ${
                            product.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isAvailable ? 'Disponível' : 'Indisponível'}
                          </span>
                        </div>
                      </div>
                      {product.isAvailable && (
                        <button 
                          onClick={() => handleRequestProduct(product.id)}
                          className="w-full bg-primary-green hover:bg-green-800 text-white py-2 px-4 rounded-lg font-medium transition shadow-sm hover:shadow-md text-sm"
                        >
                          Solicitar Coleta
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {farm.reviews && farm.reviews.length > 0 && (
            <div className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-primary-green border-b-2 border-green-100 pb-2 mb-8 inline-block">
                Avaliações de Coletores
              </h2>
              <div className="flex justify-center mb-8">
                {farm.rating && (
                  <div className="text-center">
                    <span className="text-5xl font-bold text-primary-green block">{farm.rating.toFixed(1)}</span>
                    <div className="text-warning text-2xl my-2">
                      {Array(5).fill('★').map((star, i) => (
                        <span key={i} className={i < Math.round(farm.rating) ? 'opacity-100' : 'opacity-30'}>
                          {star}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{farm.reviews.length} avaliações</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farm.reviews.map((review, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800">{review.userName}</span>
                      {review.date && (
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <div className="text-warning mb-2">
                      {Array(5).fill('★').map((star, i) => (
                        <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>
                          {star}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button className="bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md">
                  Avaliar
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/farms/add" 
              className="inline-flex items-center bg-primary-green hover:bg-green-800 text-white px-4 py-2 rounded-full text-sm font-medium transition hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <span className="mr-1">+</span> Adicionar Fazenda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FarmDetailsPage;