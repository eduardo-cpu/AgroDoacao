// filepath: /home/eduardosantossm/my-react-app/src/pages/Farm/FarmListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../../contexts/AuthContext';
import { farmService } from '../../firebase/farmService';
import { 
  mapsApiConfig, 
  defaultMapContainerStyle, 
  defaultMapCenter 
} from '../../services/googleMapsConfig';
import './styles/FarmPage.css';

const FarmListPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const { currentUser } = useAuth();

  // Carrega a API do Google Maps usando a configuração centralizada
  const { isLoaded, loadError } = useJsApiLoader(mapsApiConfig);

  // Função para carregar fazendas
  const loadFarms = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Iniciando carregamento de fazendas...');
      
      const farmsList = await farmService.getAllFarms();
      
      console.log('Fazendas carregadas:', farmsList);
      console.log('Quantidade de fazendas encontradas:', farmsList.length);
      
      if (farmsList.length === 0) {
        console.log('Nenhuma fazenda encontrada. Verificando se poderia haver um problema de permissão.');
      }
      
      setFarms(farmsList);
    } catch (err) {
      console.error('Erro ao carregar fazendas:', err);
      setError('Não foi possível carregar a lista de fazendas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega as fazendas ao iniciar
  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  // Função para quando um marcador é clicado no mapa
  const handleMarkerClick = (farm) => {
    setSelectedFarm(farm);
  };

  // Função para fechar a janela de informações
  const handleInfoWindowClose = () => {
    setSelectedFarm(null);
  };

  // Função para recarregar a lista
  const handleReload = () => {
    loadFarms();
  };

  // Renderiza mensagens de erro ou carregamento do mapa
  if (loadError) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Erro ao carregar o mapa: {loadError.message}</div>;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 py-8 bg-background-light">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-green">Fazendas com Produtos Disponíveis</h1>
        
        <button 
          onClick={handleReload} 
          className="bg-primary-green text-white px-4 py-2 rounded-lg transition hover:bg-green-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
      
      {error && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      
      {/* Mapa com marcadores das fazendas */}
      <section className="mb-10 overflow-hidden rounded-lg shadow-md">
        <div className="bg-green-50 px-4 py-3 border-b border-green-100">
          <h2 className="text-xl font-semibold text-green-800">Localização das Fazendas</h2>
        </div>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={defaultMapContainerStyle}
            center={defaultMapCenter}
            zoom={5}
          >
            {farms.map(farm => 
              farm.coordinates && (
                <Marker
                  key={farm.id}
                  position={farm.coordinates}
                  onClick={() => handleMarkerClick(farm)}
                />
              )
            )}
            
            {selectedFarm && selectedFarm.coordinates && (
              <InfoWindow
                position={selectedFarm.coordinates}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="p-2">
                  <h3 className="font-bold text-base">{selectedFarm.name}</h3>
                  <p className="mb-1 text-sm">{selectedFarm.location}</p>
                  <Link 
                    to={`/farms/${selectedFarm.id}`}
                    className="text-primary-green hover:text-green-900 font-medium text-sm"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="bg-gray-200 animate-pulse h-[400px]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green mb-2"></div>
                <p className="text-gray-500">Carregando mapa...</p>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Lista de fazendas */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-primary-green border-b-2 border-green-100 pb-2 inline-block">Fazendas Cadastradas</h2>
          <span className="bg-gray-800 text-white text-sm py-1 px-3 rounded-full">{farms.length} {farms.length === 1 ? 'fazenda' : 'fazendas'}</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-green mb-2"></div>
            <p className="text-sm">Carregando fazendas...</p>
          </div>
        ) : farms.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mt-3 text-sm">Nenhuma fazenda cadastrada no momento.</p>
            <p className="text-gray-400 mt-1 text-xs">As fazendas aparecerão aqui quando produtores rurais se cadastrarem.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map(farm => (
              <div key={farm.id} className="bg-white rounded-lg shadow-card overflow-hidden border-l-4 border-primary-green transition-all hover:shadow-card-hover hover:-translate-y-1">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-primary-green truncate">{farm.name}</h3>
                  {farm.hasProducts && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      Produtos disponíveis
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  {farm.description ? (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{farm.description}</p>
                  ) : (
                    <p className="text-gray-500 italic text-sm mb-4">Sem descrição disponível</p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="border-b border-gray-100 pb-2">
                      <span className="text-gray-700 text-sm">Localização: {farm.location}</span>
                    </div>
                    
                    {farm.preferredPickupTimes && (
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-700 text-sm">Horários: {farm.preferredPickupTimes}</span>
                      </div>
                    )}

                    {farm.contactPhone && (
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-700 text-sm">Telefone: {farm.contactPhone}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/farms/${farm.id}`} 
                    className="w-full inline-block text-center bg-primary-green hover:bg-green-800 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Ver Produtos
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default FarmListPage;