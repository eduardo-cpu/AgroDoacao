import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ReservationModal = ({ product, isOpen, onClose, onSubmit, loading }) => {
  const { currentUser } = useAuth();
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg'); // kg, g, ton
  const [message, setMessage] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Tentar preencher o telefone do usuário se disponível no perfil
  useEffect(() => {
    if (currentUser && currentUser.phoneNumber) {
      setUserPhone(currentUser.phoneNumber);
    }
  }, [currentUser]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação
    const newErrors = {};
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Informe uma quantidade válida';
    }

    // Validar telefone apenas se o usuário não tiver um telefone já registrado
    if (!currentUser?.phoneNumber && !userPhone) {
      newErrors.userPhone = 'Por favor, informe um telefone para contato';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      quantity: parseFloat(quantity),
      unit,
      message,
      userPhone
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-primary-green p-4">
          <h3 className="text-xl font-semibold text-white">Reservar Produto</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              {product.image && (
                <img 
                  src={product.image.url || product.image} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md mr-4" 
                />
              )}
              <div>
                <h4 className="text-lg font-medium text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-600">
                  Fazenda: {product.farmName || 'Não especificada'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Descrição:</span> {product.description}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Quantidade disponível:</span> {product.quantity}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Selecione a quantidade que deseja reservar:
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity) {
                      setErrors({...errors, quantity: null});
                    }
                  }}
                  className={`w-full px-4 py-2 border ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green`}
                  placeholder="Quantidade"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>
              
              <div className="w-1/3">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                >
                  <option value="g">Gramas</option>
                  <option value="kg">Quilos</option>
                  <option value="ton">Toneladas</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Campo de telefone */}
          {!currentUser?.phoneNumber && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Telefone para contato: <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => {
                  setUserPhone(e.target.value);
                  if (errors.userPhone) {
                    setErrors({...errors, userPhone: null});
                  }
                }}
                className={`w-full px-4 py-2 border ${
                  errors.userPhone ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green`}
                placeholder="(XX) XXXXX-XXXX"
              />
              {errors.userPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.userPhone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Este número será compartilhado com o produtor para contato sobre sua reserva.
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Mensagem para o produtor (opcional):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
              rows="3"
              placeholder="Adicione uma mensagem para o produtor"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-green hover:bg-green-800 text-white rounded-md transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;