import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../firebase/productService';
import { useAuth } from '../../contexts/AuthContext';
import ReservationModal from '../../components/ReservationModal';
import { reservationService } from '../../firebase/reservationService';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(productId);
        if (!productData) {
          setError('Produto não encontrado');
          return;
        }
        setProduct(productData);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        setError('Erro ao carregar informações do produto');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleReservationSubmit = async (reservationData) => {
    try {
      setReservationLoading(true);
      
      if (!currentUser) {
        toast.error('Você precisa estar logado para fazer uma reserva');
        navigate('/auth');
        return;
      }
      
      if (product.farmerId === currentUser.uid) {
        toast.error('Você não pode reservar seu próprio produto');
        return;
      }
      
      // Converter unidades para uma medida padrão se necessário
      let convertedQuantity = reservationData.quantity;
      if (reservationData.unit === 'g') {
        convertedQuantity = reservationData.quantity / 1000; // Converter para kg
      } else if (reservationData.unit === 'ton') {
        convertedQuantity = reservationData.quantity * 1000; // Converter para kg
      }
      
      await reservationService.createReservation({
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuário',
        userEmail: currentUser.email,
        userPhone: currentUser.phoneNumber || reservationData.userPhone || '', // Incluir telefone do usuário
        farmerId: product.farmerId,
        quantity: reservationData.quantity,
        unit: reservationData.unit,
        message: reservationData.message
      });
      
      toast.success('Reserva realizada com sucesso!');
      setIsReservationModalOpen(false);
    } catch (err) {
      console.error('Erro ao fazer reserva:', err);
      toast.error('Erro ao fazer reserva. Tente novamente.');
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h2 className="text-lg font-medium">{error || 'Produto não encontrado'}</h2>
          <p className="mt-2">Não foi possível carregar as informações do produto.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Imagem do produto */}
          <div className="md:w-1/2">
            {product.image ? (
              <img 
                src={product.image.url || product.image} 
                alt={product.name}
                className="w-full h-96 object-cover object-center" 
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
          </div>
          
          {/* Detalhes do produto */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {product.category}
              </span>
            </div>
            
            <div className="mt-2 flex items-center">
              <p className="text-gray-600">Fazenda: {product.farmName || 'Não especificada'}</p>
            </div>
            
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Descrição</h2>
              <p className="mt-1 text-gray-600">{product.description}</p>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Informações de disponibilidade</h2>
                  <p className="mt-1 text-gray-600">
                    {product.isAvailable ? 'Disponível para reserva' : 'Indisponível no momento'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-green-600">
                    {product.price ? `R$ ${product.price.toFixed(2)}/kg` : 'Preço não informado'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantidade disponível: {product.quantity || 'Não especificada'}
                  </p>
                </div>
              </div>
              
              {product.isAvailable && currentUser && (
                <button 
                  onClick={() => setIsReservationModalOpen(true)}
                  className="mt-4 w-full px-6 py-3 bg-primary-green hover:bg-green-700 text-white font-medium rounded-md transition duration-150 ease-in-out"
                  disabled={!product.isAvailable || product.farmerId === currentUser?.uid}
                >
                  Reservar Produto
                </button>
              )}
              
              {!currentUser && (
                <button 
                  onClick={() => navigate('/auth')}
                  className="mt-4 w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition duration-150 ease-in-out"
                >
                  Faça login para reservar
                </button>
              )}
              
              {currentUser && product.farmerId === currentUser.uid && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                  <p className="text-sm text-yellow-700">Este é seu produto, você não pode reservá-lo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Reserva */}
      <ReservationModal 
        product={product}
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSubmit={handleReservationSubmit}
        loading={reservationLoading}
      />
    </div>
  );
};

export default ProductDetailPage;