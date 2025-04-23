import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmService } from '../../firebase/farmService';
import { useAuth } from '../../contexts/AuthContext';
import MapSelector from '../../components/MapSelector';
import './styles/FarmPage.css';

const NewFarmPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactPhone: '',
    preferredPickupTimes: '',
    coordinates: null,
    address: {
      street: '',
      streetNumber: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      formattedAddress: ''
    }
  });
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Preencher o telefone do usuário se disponível
    if (currentUser.phone) {
      setFormData(prev => ({ ...prev, contactPhone: currentUser.phone }));
    }
  }, [currentUser, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLocationSelect = (coordinates, geocodeResult, addressDetails) => {
    setFormData(prev => ({
      ...prev,
      coordinates,
      location: addressDetails?.formattedAddress || geocodeResult?.formatted_address || prev.location,
      address: {
        ...prev.address,
        ...(addressDetails || {}),
        formattedAddress: addressDetails?.formattedAddress || geocodeResult?.formatted_address || prev.address.formattedAddress
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validações básicas
      if (!formData.name) {
        throw new Error("Por favor, informe o nome da fazenda");
      }
      
      if (!formData.location) {
        throw new Error("Por favor, informe a localização da fazenda");
      }
      
      if (!formData.coordinates) {
        throw new Error("Por favor, selecione a localização da fazenda no mapa");
      }
      
      // Preparar os dados para salvar
      const newFarmData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        contactPhone: formData.contactPhone,
        preferredPickupTimes: formData.preferredPickupTimes,
        coordinates: formData.coordinates,
        address: formData.address,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.name || 'Produtor Rural',
        ownerEmail: currentUser.email,
        hasProducts: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Criar nova fazenda
      const farm = await farmService.createFarm(newFarmData);
      
      setSuccess("Fazenda cadastrada com sucesso! Redirecionando...");
      
      // Aguardar um momento antes de redirecionar
      setTimeout(() => {
        navigate('/minhas-fazendas');
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar fazenda:", error);
      setError(error.message || "Ocorreu um erro ao cadastrar a fazenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-background-light min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary-green">Cadastrar Nova Fazenda</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Sucesso!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Nome da Fazenda/Propriedade*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Fazenda Esperança, Sítio Recanto Verde..."
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Descrição da Produção
            </label>
            <textarea
              id="description"
              name="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="3"
              placeholder="Descreva o tipo de produção da sua fazenda (ex: Produção de hortaliças orgânicas, frutas da estação...)"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-gray-700 font-semibold mb-2">
              Telefone para Contato*
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          
          <div>
            <label htmlFor="preferredPickupTimes" className="block text-gray-700 font-semibold mb-2">
              Horários Preferidos para Coleta
            </label>
            <input
              type="text"
              id="preferredPickupTimes"
              name="preferredPickupTimes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={formData.preferredPickupTimes}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ex: Segunda a Sexta, das 8h às 17h"
            />
          </div>
          
          <div className="pt-4">
            <label className="block text-gray-700 font-semibold mb-2 text-primary-green">
              Localização da Fazenda no Mapa*
            </label>
            
            <div className="border-2 border-primary-green rounded-lg p-4 bg-green-50">
              <div className="bg-green-100 p-4 rounded-lg mb-4 border border-green-300">
                <p className="font-bold text-green-800 flex items-center mb-1">
                  <span className="mr-1">⚠️</span> IMPORTANTE: Para cadastrar sua fazenda, você precisa definir sua localização exata no mapa.
                </p>
                <p className="text-green-700">
                  Digite seu endereço para buscar ou clique diretamente no mapa para marcar o ponto exato da sua propriedade.
                </p>
              </div>
              
              <MapSelector
                onSelectLocation={handleLocationSelect}
                initialAddress={formData.location}
                initialPosition={formData.coordinates}
              />
              
              {formData.coordinates ? (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                  <p className="flex items-center font-semibold mb-2">
                    <span className="mr-1">✅</span> Localização selecionada com sucesso:
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Coordenadas:</span> {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </p>
                  <p>
                    <span className="font-semibold">Endereço:</span> {formData.address.formattedAddress || formData.location}
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-300">
                  <p className="flex items-center font-semibold mb-2">
                    <span className="mr-1">⚠️</span> Você ainda não selecionou uma localização no mapa.
                  </p>
                  <p>
                    Clique em um ponto específico no mapa para marcar a localização da sua fazenda.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/minhas-fazendas')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg text-md font-medium transition shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className={`bg-primary-green hover:bg-green-800 text-white py-3 px-8 rounded-lg text-lg font-bold transition shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Fazenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFarmPage;