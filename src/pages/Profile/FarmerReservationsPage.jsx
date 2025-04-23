import React, { useState, useEffect } from 'react';
import { reservationService } from '../../firebase/reservationService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const FarmerReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [contactInfo, setContactInfo] = useState(null);

  // Estado para filtrar as reservas
  const [statusFilter, setStatusFilter] = useState('pending');
  const [filteredReservations, setFilteredReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const farmerReservations = await reservationService.getFarmerReservations(currentUser.uid);
        
        // Ordenar do mais recente para o mais antigo
        farmerReservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setReservations(farmerReservations);
      } catch (err) {
        console.error('Erro ao buscar reservas:', err);
        setError('Erro ao carregar as reservas. Por favor, tente novamente.');
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

  const handleApproveReservation = async (reservationId) => {
    try {
      await reservationService.approveReservation(reservationId);
      
      // Atualizar a lista de reservas com o novo status
      setReservations(prev =>
        prev.map(res => 
          res.id === reservationId ? { ...res, status: 'approved' } : res
        )
      );
    } catch (err) {
      console.error('Erro ao aprovar a reserva:', err);
      alert(err.message || 'Erro ao aprovar a reserva. Por favor, tente novamente.');
    }
  };

  const handleRejectReservation = async (reservationId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar esta reserva?')) {
      return;
    }

    try {
      await reservationService.rejectReservation(reservationId);
      setReservations(prev =>
        prev.map(res => 
          res.id === reservationId ? { ...res, status: 'rejected' } : res
        )
      );
    } catch (err) {
      console.error('Erro ao rejeitar a reserva:', err);
      alert('Erro ao rejeitar a reserva. Por favor, tente novamente.');
    }
  };

  const handleShowContactInfo = (reservation) => {
    setContactInfo(reservation);
  };

  const handleCloseContactInfo = () => {
    setContactInfo(null);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Reservas</h1>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <p className="text-gray-600 mb-4 md:mb-0">
              Aqui você pode gerenciar todas as reservas para seus produtos.
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
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Solicitante</th>
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
                          <div className="font-medium text-gray-800">{reservation.productName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {reservation.quantity} {reservation.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {reservation.userName} 
                        <div className="text-xs text-gray-500">{reservation.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        {formatDate(reservation.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveReservation(reservation.id)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleRejectReservation(reservation.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleShowContactInfo(reservation)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition"
                            title="Ver informações de contato"
                          >
                            Contato
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Modal de Informações de Contato */}
              {contactInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium text-gray-800">
                        Informações de Contato
                      </h3>
                      <button 
                        onClick={handleCloseContactInfo}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="border-t border-b border-gray-200 py-4 my-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Nome do Cliente</h4>
                        <p className="text-gray-800">{contactInfo.userName}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                        <p className="text-gray-800">{contactInfo.userEmail}</p>
                      </div>
                      
                      {contactInfo.userPhone ? (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Telefone</h4>
                          <p className="text-gray-800">{contactInfo.userPhone}</p>
                          <button
                            onClick={() => window.open(`tel:${contactInfo.userPhone}`, '_blank')}
                            className="mt-2 px-4 py-2 bg-primary-green hover:bg-green-700 text-white rounded-lg flex items-center justify-center w-full transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Ligar para {contactInfo.userName}
                          </button>
                        </div>
                      ) : (
                        <div className="mb-3 text-yellow-600 bg-yellow-50 p-3 rounded-md">
                          <p className="text-sm">Telefone não informado pelo usuário.</p>
                        </div>
                      )}
                      
                      <div className="mb-1">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Status da Reserva</h4>
                        <p>{getStatusBadge(contactInfo.status)}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      <p>Reserva feita em: {formatDate(contactInfo.createdAt)}</p>
                      <p className="mt-1">Produto: {contactInfo.productName} ({contactInfo.quantity} {contactInfo.unit})</p>
                    </div>
                    
                    <button
                      onClick={handleCloseContactInfo}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">
                {statusFilter === 'all' 
                  ? "Você ainda não recebeu nenhuma reserva." 
                  : `Você não tem reservas com status "${statusFilter}".`}
              </p>
              <p className="text-gray-400 mb-6">
                {statusFilter === 'all'
                  ? "Quando usuários reservarem seus produtos, eles aparecerão aqui."
                  : "Tente selecionar outro status no filtro acima."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerReservationsPage;