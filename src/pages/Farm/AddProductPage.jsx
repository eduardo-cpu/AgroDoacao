import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../firebase/productService';
import { farmService } from '../../firebase/farmService';
import { useAuth } from '../../contexts/AuthContext';

const AddProductPage = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias a partir de hoje
    location: '',
    category: '',
    isAvailable: true
  });

  // Carregar dados da fazenda para verificar permissões
  useEffect(() => {
    const loadFarm = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const farmData = await farmService.getFarmById(farmId);
        
        // Verificar se a fazenda pertence ao usuário atual
        if (farmData.ownerId !== currentUser.uid) {
          navigate('/minhas-fazendas');
          return;
        }
        
        setFarm(farmData);
        // Pré-preencher a localização com o endereço da fazenda
        setFormData(prev => ({
          ...prev,
          location: farmData.location || ''
        }));
      } catch (err) {
        console.error('Erro ao carregar fazenda:', err);
        setError('Não foi possível carregar os dados da fazenda.');
      }
    };

    loadFarm();
  }, [currentUser, farmId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Validações básicas
      if (!formData.name) {
        throw new Error('O nome do produto é obrigatório');
      }
      if (!formData.quantity) {
        throw new Error('A quantidade do produto é obrigatória');
      }
      if (!formData.expiryDate) {
        throw new Error('A data de validade é obrigatória');
      }

      // Criando objeto do produto
      const productData = {
        ...formData,
        farmId,
        farmName: farm.name,
        ownerName: farm.ownerName || currentUser.displayName || currentUser.email,
        ownerId: currentUser.uid,
        farmLocation: farm.location,
        farmCoordinates: farm.coordinates || null,
        createdAt: new Date().toISOString()
      };

      // Adicionando o produto
      await productService.addProduct(productData);
      
      setSuccess('Produto adicionado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/farm/${farmId}/products`);
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      setError(err.message || 'Não foi possível adicionar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Frutas', 
    'Verduras', 
    'Legumes', 
    'Grãos', 
    'Raízes', 
    'Cereais', 
    'Lácteos', 
    'Outros'
  ];

  const units = [
    'kg', 'g', 'L', 'ml', 'unidade', 'caixa', 'pacote', 'saco'
  ];

  if (!farm && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <main className="bg-background-light min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary-green p-6">
          <h1 className="text-2xl font-bold text-white">Adicionar Novo Produto</h1>
          <p className="text-green-100 mt-1">Cadastre um produto para doação em sua fazenda</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6" role="alert">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-6" role="alert">
            <p className="font-bold">Sucesso!</p>
            <p>{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Batata, Tomate, Cenoura..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o produto (tipo, qualidade, etc.)"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-grow">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade*
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Ex: 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                  disabled={loading}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="w-1/3">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                  disabled={loading}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade*
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Localização na Fazenda
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Depósito, Galpão 2..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Produto disponível para doação
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate(`/farm/${farmId}/products`)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-primary-green hover:bg-green-800 text-white font-medium rounded-md shadow-sm transition"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Adicionar Produto'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddProductPage;