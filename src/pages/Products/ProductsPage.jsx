import React, { useState, useEffect } from 'react';
import { productService } from '../../firebase/productService';
import { reservationService } from '../../firebase/reservationService';
import { useAuth } from '../../contexts/AuthContext';
import ReservationModal from '../../components/ReservationModal';
import './styles/ProductsPage.css';
import { useNavigate } from 'react-router-dom';

const PRODUCTS_PER_PAGE = 6; // Number of products to show per page
const PRODUCT_CATEGORIES = [
  'Frutas', 'Verduras', 'Legumes', 'Grãos', 'Laticínios', 'Outros'
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtering and sorting state
  const [filters, setFilters] = useState({
    category: '',
    expiryDays: '',
    searchTerm: ''
  });
  const [sortOption, setSortOption] = useState('expiry-asc'); // Default sort by expiry date ascending

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    quantity: '',
    expiryDate: '',
    location: '',
    category: '',
    farmId: currentUser?.uid || '',
    isAvailable: true
  });

  const [showForm, setShowForm] = useState(false);

  // State for reservation modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getAllAvailableProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
        setTotalPages(Math.ceil(productsData.length / PRODUCTS_PER_PAGE));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    // Apply filters and sorting when products, filters or sort option changes
    let result = [...products];

    // Apply category filter
    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }

    // Apply expiry days filter
    if (filters.expiryDays) {
      const daysValue = parseInt(filters.expiryDays);
      result = result.filter(product => {
        const days = daysUntilExpiry(product.expiryDate);
        return days <= daysValue;
      });
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          (product.farmName && product.farmName.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'expiry-asc':
        result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        break;
      case 'expiry-desc':
        result.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setTotalPages(Math.ceil(result.length / PRODUCTS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, filters, sortOption]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add the farmId if available
      const productData = {
        ...newProduct,
        farmId: currentUser?.uid || '',
        isAvailable: true
      };

      const newProductData = await productService.addProduct(productData);
      setProducts([...products, newProductData]);

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        quantity: '',
        expiryDate: '',
        location: '',
        category: '',
        farmId: currentUser?.uid || '',
        isAvailable: true
      });

      setShowForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erro ao cadastrar produto. Tente novamente.');
    }
  };

  const handleRequestProduct = (product) => {
    if (!currentUser) {
      alert('Você precisa estar logado para reservar produtos');
      navigate('/auth/login');
      return;
    }

    setSelectedProduct(product);
    setIsReservationModalOpen(true);
    setReservationError('');
  };

  const handleCloseReservationModal = () => {
    setIsReservationModalOpen(false);
    setSelectedProduct(null);
    setReservationSuccess(false);
    setReservationError('');
  };

  const handleSubmitReservation = async (formData) => {
    if (!currentUser || !selectedProduct) return;

    try {
      setReservationLoading(true);
      setReservationError('');

      // Prepare reservation data
      const reservationData = {
        productId: selectedProduct.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuário',
        userEmail: currentUser.email,
        farmerId: selectedProduct.farmId,
        quantity: formData.quantity,
        unit: formData.unit,
        message: formData.message
      };

      // Create reservation
      await reservationService.createReservation(reservationData);

      // Show success message
      setReservationSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsReservationModalOpen(false);
        setSelectedProduct(null);
        setReservationSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
      setReservationError(error.message || 'Erro ao fazer reserva. Tente novamente.');
    } finally {
      setReservationLoading(false);
    }
  };

  // Função auxiliar para calcular dias até a expiração
  const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get current products for pagination
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <main className="bg-background-light min-h-screen">
      <div className="relative h-[300px] md:h-[250px] flex items-end bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Produtos Disponíveis</h1>
          <p className="text-white text-lg max-w-xl">
            Produtos agrícolas disponíveis para doação em fazendas locais.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="max-w-xl">
            <p className="text-gray-700 text-sm md:text-base">
              Produtos próximos da data de validade, em perfeitas condições para consumo.
              Selecione e agende sua coleta.
            </p>
          </div>
        </div>

        {/* Filtering and Sorting controls */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="searchTerm" className="block text-gray-700 font-semibold mb-2">Buscar:</label>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                placeholder="Nome ou descrição..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Categoria:</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              >
                <option value="">Todas</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expiryDays" className="block text-gray-700 font-semibold mb-2">Validade (até):</label>
              <select
                id="expiryDays"
                name="expiryDays"
                value={filters.expiryDays}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              >
                <option value="">Qualquer</option>
                <option value="3">3 dias</option>
                <option value="7">7 dias</option>
                <option value="14">14 dias</option>
                <option value="30">30 dias</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortOption" className="block text-gray-700 font-semibold mb-2">Ordenar por:</label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              >
                <option value="expiry-asc">Validade (mais próxima)</option>
                <option value="expiry-desc">Validade (mais distante)</option>
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-primary-green mb-6">Cadastrar Produto para Doação</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Nome do Produto</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Categoria</label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {PRODUCT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.description}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2">Quantidade Disponível</label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-gray-700 font-semibold mb-2">Data de Validade</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">Localização</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={newProduct.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-primary-green hover:bg-green-800 text-white py-2 px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
            <span className="ml-3 text-gray-600">Carregando produtos...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Exibindo {currentProducts.length} de {filteredProducts.length} produtos
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map(product => (
                <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition border border-gray-200" key={product.id}>
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
                    <p className="text-sm mb-2"><span className="font-medium">Fazenda:</span> {product.farmName || "Não especificada"}</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="space-y-1 mb-4 text-sm">
                      <p><span className="font-medium">Quantidade:</span> {product.quantity}</p>
                      <p>
                        <span className="font-medium">Validade:</span> {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p><span className="font-medium">Localização:</span> {product.location}</p>
                    </div>
                    <button
                      className="w-full bg-primary-green hover:bg-green-800 text-white py-2 px-4 rounded-lg font-medium transition shadow-sm hover:shadow-md"
                      onClick={() => handleRequestProduct(product)}
                    >
                      Reservar Produto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white p-16 rounded-xl shadow-md text-center">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado com os filtros atuais.</p>
            <button
              onClick={() => {
                setFilters({
                  category: '',
                  expiryDays: '',
                  searchTerm: ''
                });
              }}
              className="mt-4 bg-primary-green hover:bg-green-800 text-white py-2 px-4 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {filteredProducts.length > PRODUCTS_PER_PAGE && (
          <div className="flex justify-center mt-8 mb-10">
            <nav className="inline-flex rounded-md shadow-sm" aria-label="Paginação">
              <button
                className="inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>

              <button
                className="inline-flex items-center px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                const pageNum = currentPage > 3 && totalPages > 5
                  ? currentPage - 2 + i
                  : i + 1;

                // Don't render if outside of range
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 ${
                      currentPage === pageNum
                        ? 'bg-primary-green text-white hover:bg-green-800'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } text-sm font-medium`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="inline-flex items-center px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>

              <button
                className="inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {selectedProduct && (
        <ReservationModal
          product={selectedProduct}
          isOpen={isReservationModalOpen}
          onClose={handleCloseReservationModal}
          onSubmit={handleSubmitReservation}
          loading={reservationLoading}
        />
      )}

      {/* Feedback Messages */}
      {reservationSuccess && (
        <div className="fixed bottom-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Reserva realizada com sucesso!</span>
          </div>
        </div>
      )}

      {reservationError && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{reservationError}</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductsPage;