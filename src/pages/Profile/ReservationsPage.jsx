import React, { useState, useEffect } from 'react';
import { reservationService } from '../../firebase/reservationService';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px',
  marginTop: '20px'
};

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Estado para filtrar as reservas
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredReservations, setFilteredReservations] = useState([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const fetchReservations = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userReservations = await reservationService.getUserReservations(currentUser.uid);
        
        // Ordenar do mais recente para o mais antigo
        userReservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setReservations(userReservations);
      } catch (err) {
        console.error('Erro ao buscar reservas:', err);
        setError('Erro ao carregar suas reservas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [currentUser]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(res => res.status === statusFilter));
    }
  }, [reservations, statusFilter]);

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await reservationService.cancelReservation(reservationId);
      setReservations(prev =>
        prev.map(res => 
          res.id === reservationId ? { ...res, status: 'cancelled' } : res
        )
      );
    } catch (err) {
      console.error('Erro ao cancelar a reserva:', err);
      alert('Erro ao cancelar a reserva. Por favor, tente novamente.');
    }
  };

  const handleViewLocation = (reservation) => {
    setSelectedReservation(reservation);
    setShowMap(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aprovada</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejeitada</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Concluída</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Cancelada</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-background-light min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Minhas Reservas</h1>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <p className="text-gray-600 mb-4 md:mb-0">
              Aqui você pode acompanhar e gerenciar todas as suas reservas de produtos.
            </p>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Filtrar por:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition text-sm"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovadas</option>
                <option value="rejected">Rejeitadas</option>
                <option value="completed">Concluídas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
              <span className="ml-3 text-gray-600">Carregando reservas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-green hover:bg-green-800 text-white rounded-lg transition"
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Produto</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Quantidade</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Fazenda</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Data</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {reservation.productImage && (
                            <img 
                              src={reservation.productImage?.url || reservation.productImage} 
                              alt={reservation.productName} 
                              className="w-10 h-10 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {reservation.productId ? (
                                <Link 
                                  to={`/produtos/${reservation.productId}`} 
                                  className="text-primary-green hover:underline"
                                >
                                  {reservation.productName}
                                </Link>
                              ) : (
                                reservation.productName
                              )}
                            </div>
                            {reservation.productId && (
                              <div className="text-xs text-gray-500">
                                <Link 
                                  to={`/produtos/${reservation.productId}`}
                                  className="hover:underline"
                                >
                                  Ver detalhes do produto
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {reservation.quantity} {reservation.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {reservation.farmId ? (
                          <Link 
                            to={`/fazendas/${reservation.farmId}`}
                            className="text-primary-green hover:underline"
                          >
                            {reservation.farmerName}
                          </Link>
                        ) : (
                          reservation.farmerName
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        {formatDate(reservation.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                          >
                            Cancelar
                          </button>
                        )}
                        {reservation.status === 'approved' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`tel:${reservation.farmerPhone || ''}`, '_blank')}
                              className="px-3 py-1 bg-primary-green hover:bg-green-800 text-white rounded text-sm transition"
                            >
                              Contato
                            </button>
                            <button
                              onClick={() => handleViewLocation(reservation)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition"
                            >
                              Localização
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mapa para exibir a localização da fazenda */}
              {showMap && selectedReservation && (
                <div className="mt-8 border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      Localização: {selectedReservation.farmerName}
                    </h3>
                    <button 
                      onClick={() => setShowMap(false)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {isLoaded && selectedReservation.farmLocation ? (
                    selectedReservation.farmLocation?.coordinates ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{
                          lat: selectedReservation.farmLocation.coordinates.lat || 0,
                          lng: selectedReservation.farmLocation.coordinates.lng || 0
                        }}
                        zoom={15}
                      >
                        <Marker
                          position={{
                            lat: selectedReservation.farmLocation.coordinates.lat || 0,
                            lng: selectedReservation.farmLocation.coordinates.lng || 0
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Localização exata não disponível.
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center" style={{ height: '250px' }}>
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-1">Endereço:</h4>
                    <p className="text-gray-600">
                      {selectedReservation.farmLocation?.address?.formattedAddress || 
                       selectedReservation.farmLocation || 
                       "Endereço não disponível"}
                    </p>
                    
                    {selectedReservation.farmerPhone && (
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-700 mb-1">Telefone:</h4>
                        <p className="text-gray-600">{selectedReservation.farmerPhone}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-gray-600 text-sm">
                      <p>Entre em contato com o produtor antes de ir até a fazenda.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">
                {statusFilter === 'all' 
                  ? "Você ainda não fez nenhuma reserva." 
                  : `Você não tem reservas com status "${statusFilter}".`}
              </p>
              <p className="text-gray-400 mb-6">
                {statusFilter === 'all'
                  ? "Visite a página de produtos para fazer sua primeira reserva."
                  : "Tente selecionar outro status no filtro acima."}
              </p>
              {statusFilter === 'all' && (
                <button
                  onClick={() => window.location.href = '/products'}
                  className="px-4 py-2 bg-primary-green hover:bg-green-800 text-white rounded-lg transition"
                >
                  Ver Produtos Disponíveis
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;