import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../firebase/productService';
import { farmService } from '../../firebase/farmService';
import { useAuth } from '../../contexts/AuthContext';

const EditProductPage = () => {
  const { farmId, productId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    location: '',
    category: '',
    isAvailable: true
  });

  // Carregar dados da fazenda e do produto
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Carregar fazenda
        const farmData = await farmService.getFarmById(farmId);
        
        // Verificar se a fazenda pertence ao usuário atual
        if (farmData.ownerId !== currentUser.uid) {
          navigate('/minhas-fazendas');
          return;
        }
        
        setFarm(farmData);
        
        // Carregar produto
        const productData = await productService.getProductById(productId);
        
        if (!productData) {
          throw new Error('Produto não encontrado');
        }
        
        if (productData.farmId !== farmId) {
          throw new Error('Este produto não pertence a esta fazenda');
        }
        
        // Formatar a data de validade para o formato do input date
        const expiryDate = productData.expiryDate ? 
          new Date(productData.expiryDate).toISOString().split('T')[0] :
          '';
        
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          quantity: productData.quantity || '',
          unit: productData.unit || 'kg',
          expiryDate,
          location: productData.location || '',
          category: productData.category || '',
          isAvailable: productData.isAvailable !== false // default true se não estiver definido
        });
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Não foi possível carregar os dados do produto.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, farmId, productId, navigate]);

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
      setSubmitting(true);
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

      // Atualizando o produto
      const updates = {
        ...formData,
        updateImage: formData.name !== farm.name, // Atualizar imagem apenas se o nome mudar
        updatedAt: new Date().toISOString()
      };

      await productService.updateProduct(productId, updates);
      
      setSuccess('Produto atualizado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/farm/${farmId}/products`);
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError(err.message || 'Não foi possível atualizar o produto.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

  if (error && !farm) {
    return (
      <div className="bg-background-light min-h-screen py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
            <button 
              onClick={() => navigate(`/farm/${farmId}/products`)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Voltar para Produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background-light min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h1 className="text-2xl font-bold text-white">Editar Produto</h1>
          <p className="text-blue-100 mt-1">Atualize as informações do seu produto</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Alterar o nome do produto pode atualizar sua imagem.
              </p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={submitting}
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
              disabled={submitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition"
              disabled={submitting}
            >
              {submitting ? 'Salvando...' : 'Atualizar Produto'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProductPage;