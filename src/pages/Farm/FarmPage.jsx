// filepath: /home/eduardosantossm/my-react-app/src/pages/Farm/FarmPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import farmService from '../../firebase/farmService';
import productService from '../../firebase/productService';
import MapSelector from '../../components/MapSelector';

const FarmPage = () => {
  const { currentUser, userFarm, updateFarmData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [farm, setFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    preferredPickupTimes: '',
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
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    isAvailable: true
  });
  const [addingProduct, setAddingProduct] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        let farmData = userFarm;
        if (!farmData) {
          farmData = await farmService.getFarmByOwnerId(currentUser.uid);
          if (!farmData) {
            navigate('/profile/farm-setup');
            return;
          }
        }
        
        setFarm(farmData);
        setFormData({
          name: farmData.name || '',
          description: farmData.description || '',
          location: farmData.location || '',
          preferredPickupTimes: farmData.preferredPickupTimes || '',
          address: farmData.address || {
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
        
        const farmProducts = await productService.getProductsByFarm(farmData.id);
        setProducts(farmProducts);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser, navigate, userFarm]);
  
  const handleUpdateFarm = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const updatedFarm = await farmService.updateFarm(farm.id, formData);
      setFarm(updatedFarm);
      
      if (updateFarmData) {
        await updateFarmData(updatedFarm);
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar fazenda:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    
    try {
      setAddingProduct(true);
      
      const productData = {
        ...newProduct,
        farmId: farm.id,
        farmName: farm.name,
        farmLocation: farm.location,
        quantity: Number(newProduct.quantity) || 0
      };
      
      const addedProduct = await productService.addProduct(productData);
      setProducts([...products, addedProduct]);
      
      if (!farm.hasProducts) {
        await farmService.updateFarm(farm.id, { hasProducts: true });
        setFarm({ ...farm, hasProducts: true });
      }
      
      setNewProduct({
        name: '',
        description: '',
        quantity: '',
        unit: 'kg',
        isAvailable: true
      });
      
      setShowAddProduct(false);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    } finally {
      setAddingProduct(false);
    }
  };
  
  const handleLocationUpdate = async (coordinates, geocodeResult, addressDetails) => {
    if (!farm) return;
    
    try {
      const locationUpdate = {
        coordinates,
        address: {
          ...formData.address,
          ...(addressDetails || {}),
          formattedAddress: addressDetails?.formattedAddress || geocodeResult?.formatted_address || ''
        }
      };
      
      setFormData(prev => ({
        ...prev,
        location: addressDetails?.formattedAddress || geocodeResult?.formatted_address || prev.location,
        address: {
          ...prev.address,
          ...(addressDetails || {}),
          formattedAddress: addressDetails?.formattedAddress || geocodeResult?.formatted_address || prev.address.formattedAddress
        }
      }));
      
      if (!editMode) {
        await farmService.updateFarm(farm.id, locationUpdate);
        setFarm({ ...farm, ...locationUpdate });
        
        if (updateFarmData) {
          await updateFarmData(locationUpdate);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
  
  return (
    <main className="w-full max-w-7xl mx-auto px-4 py-8 bg-background-light">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-primary-green mb-4 md:mb-0">Minha Fazenda</h1>
        <div className="flex flex-wrap gap-3">
          {!editMode
            ? <button 
                className="bg-primary-green text-white px-4 py-2 rounded-lg transition hover:bg-green-800"
                onClick={() => setEditMode(true)}
              >
                Editar Informações
              </button>
            : <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg transition hover:bg-gray-600"
                onClick={() => setEditMode(false)}
              >
                Cancelar Edição
              </button>
          }
          <Link to="/fazendas" className="bg-blue-600 text-white px-4 py-2 rounded-lg transition hover:bg-blue-700">
            Ver Todas as Fazendas
          </Link>
        </div>
      </header>

      {/* Edição de fazenda */}
      {editMode && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleUpdateFarm}>
            <div className="mb-6">
              <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Nome da Fazenda</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                rows={4}
              />
            </div>
            
            <div className="my-8">
              <h3 className="text-xl font-bold mb-4 text-primary-green">Informações de Localização</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="street" className="block mb-2 font-semibold text-gray-700">Rua/Estrada</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="streetNumber" className="block mb-2 font-semibold text-gray-700">Número</label>
                  <input
                    type="text"
                    id="streetNumber"
                    name="streetNumber"
                    value={formData.address.streetNumber}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="complement" className="block mb-2 font-semibold text-gray-700">Complemento</label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    value={formData.address.complement}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                    placeholder="Apto, Sala, Ponto de Referência"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="neighborhood" className="block mb-2 font-semibold text-gray-700">Bairro/Região</label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-4">
                  <label htmlFor="city" className="block mb-2 font-semibold text-gray-700">Cidade</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="state" className="block mb-2 font-semibold text-gray-700">Estado</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="postalCode" className="block mb-2 font-semibold text-gray-700">CEP</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.address.postalCode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="formattedAddress" className="block mb-2 font-semibold text-gray-700">Endereço Completo</label>
                <textarea
                  id="formattedAddress"
                  name="formattedAddress"
                  value={formData.address.formattedAddress}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  rows={2}
                  placeholder="Endereço completo ou referência adicional"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Este campo será preenchido automaticamente quando você selecionar uma localização no mapa.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="preferredPickupTimes" className="block mb-2 font-semibold text-gray-700">Horários Preferidos para Coleta</label>
              <input
                type="text"
                id="preferredPickupTimes"
                name="preferredPickupTimes"
                value={formData.preferredPickupTimes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                placeholder="Ex: Segunda a Sexta, 8h às 17h"
              />
            </div>

            {/* Inserir seleção de localização no mapa no formulário */}
            <div className="mb-8">
              <label className="block mb-2 font-semibold text-gray-700">Localização da Fazenda</label>
              <div className="rounded-lg overflow-hidden border-2 border-primary-green">
                <MapSelector
                  initialPosition={farm?.coordinates}
                  initialAddress={farm?.address?.formattedAddress || farm?.location || ''}
                  onSelectLocation={handleLocationUpdate}
                  zoom={farm?.coordinates ? 13 : 5}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`bg-primary-green hover:bg-green-800 text-white py-3 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      )}

      {/* Visualização - apenas nome da fazenda */}
      {!editMode && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary-green mb-4">{farm?.name}</h2>
          
          {farm?.description && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-gray-700">{farm.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary-green">Informações de Contato</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Proprietário:</span> {farm?.ownerName || currentUser?.displayName || 'Não informado'}</p>
                {farm?.contactPhone && <p><span className="font-medium">Telefone:</span> {farm.contactPhone}</p>}
                {farm?.preferredPickupTimes && <p><span className="font-medium">Horários para Coleta:</span> {farm.preferredPickupTimes}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary-green">Localização</h3>
              <p className="text-gray-700 mb-2">{farm?.address?.formattedAddress || farm?.location || 'Localização não informada'}</p>
              
              {farm?.coordinates && (
                <div className="mt-2">
                  <Link 
                    to={`/farms/${farm.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <span>Ver no mapa</span>
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Produtos da fazenda */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary-green">Produtos Disponíveis para Doação</h2>
          <button 
            onClick={() => setShowAddProduct(!showAddProduct)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              showAddProduct 
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                : 'bg-primary-green hover:bg-green-800 text-white'
            }`}
          >
            {showAddProduct ? 'Cancelar' : 'Adicionar Produto'}
          </button>
        </div>
        
        {showAddProduct && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-primary-green mb-4">Adicionar Novo Produto</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="productName" className="block mb-2 font-semibold text-gray-700">Nome do Produto*</label>
                  <input
                    type="text"
                    id="productName"
                    name="name"
                    value={newProduct.name}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                    required
                    placeholder="Ex: Banana, Tomate, Alface..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block mb-2 font-semibold text-gray-700">Quantidade</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                      min="0"
                      placeholder="Ex: 10"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="unit" className="block mb-2 font-semibold text-gray-700">Unidade</label>
                    <select
                      id="unit"
                      name="unit"
                      value={newProduct.unit}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                    >
                      <option value="kg">kg</option>
                      <option value="unidade">unidade</option>
                      <option value="caixa">caixa</option>
                      <option value="saco">saco</option>
                      <option value="litro">litro</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleProductChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  rows={3}
                  placeholder="Informações adicionais sobre o produto..."
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={newProduct.isAvailable}
                    onChange={handleProductChange}
                    className="w-5 h-5 text-primary-green border-gray-300 focus:ring-primary-green rounded mr-2"
                  />
                  <span className="text-gray-700">Produto disponível para doação</span>
                </label>
              </div>
              
              <div>
                <button 
                  type="submit" 
                  className={`bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg ${addingProduct ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={addingProduct}
                >
                  {addingProduct ? 'Adicionando...' : 'Adicionar Produto'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  *Uma imagem será automaticamente buscada com base no nome do produto.
                </p>
              </div>
            </form>
          </div>
        )}
        
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">Você ainda não adicionou nenhum produto para doação.</p>
            {!showAddProduct && (
              <button 
                onClick={() => setShowAddProduct(true)}
                className="mt-4 bg-primary-green hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md"
              >
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-200 transition hover:shadow-card-hover">
                <div className="h-48 overflow-hidden bg-gray-100 relative">
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
                  <div className={`absolute top-2 right-2 text-xs font-bold py-1 px-3 rounded-full 
                    ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.isAvailable ? 'Disponível' : 'Indisponível'}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                  
                  <p className="text-gray-700 mb-3 text-sm">
                    {product.description || 'Sem descrição disponível.'}
                  </p>
                  
                  {product.quantity && (
                    <p className="text-sm mb-4">
                      <span className="font-semibold">Quantidade:</span> {product.quantity} {product.unit}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button 
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition 
                        ${product.isAvailable 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      onClick={() => {
                        productService.updateProduct(product.id, { 
                          isAvailable: !product.isAvailable
                        }).then(updatedProduct => {
                          setProducts(products.map(p => 
                            p.id === updatedProduct.id ? updatedProduct : p
                          ));
                        });
                      }}
                    >
                      {product.isAvailable ? 'Marcar Indisponível' : 'Marcar Disponível'}
                    </button>
                    
                    <button 
                      className="bg-red-100 text-red-800 hover:bg-red-200 py-2 px-3 rounded-lg text-sm font-medium transition"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente excluir o produto "${product.name}"?`)) {
                          productService.deleteProduct(product.id).then(() => {
                            setProducts(products.filter(p => p.id !== product.id));
                          });
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default FarmPage;