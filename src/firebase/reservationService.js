import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  doc, 
  getDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { productService } from './productService';

const RESERVATIONS_COLLECTION = 'reservations';

class ReservationService {
  /**
   * Cria uma nova reserva de produto
   * @param {Object} reservationData - Dados da reserva
   * @param {string} reservationData.productId - ID do produto
   * @param {string} reservationData.userId - ID do usuário
   * @param {string} reservationData.farmerId - ID do fazendeiro
   * @param {number} reservationData.quantity - Quantidade de produto reservado
   * @param {string} reservationData.unit - Unidade (g, kg, ton)
   * @returns {Promise<Object>} - A reserva criada
   */
  async createReservation(reservationData) {
    try {
      // Buscar informações adicionais do produto
      const product = await productService.getProductById(reservationData.productId);
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      // Criar o objeto de reserva
      const reservation = {
        ...reservationData,
        productName: product.name,
        productImage: product.image,
        farmerName: product.farmName,
        farmerPhone: product.farmerPhone || '',
        userPhone: reservationData.userPhone || '',  // Incluindo telefone do usuário
        status: 'pending', // pending, approved, rejected, completed, cancelled
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Salvar no Firestore
      const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), reservation);
      
      // Retorna a reserva com o ID
      return {
        id: docRef.id,
        ...reservation
      };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  }
  
  /**
   * Busca todas as reservas de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Lista de reservas do usuário
   */
  async getUserReservations(userId) {
    try {
      // Primeiro, tente obter os dados com ordenação
      try {
        const q = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const reservations = [];
        querySnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        return reservations;
      } catch (indexError) {
        // Se falhar por falta de índice, tente sem a ordenação
        console.warn('Índice ausente para ordenação. Obtendo dados sem ordenação por data.', indexError);
        
        const fallbackQuery = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('userId', '==', userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        const reservations = [];
        fallbackSnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        // Ordenar manualmente
        reservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return reservations;
      }
    } catch (error) {
      console.error('Erro ao buscar reservas do usuário:', error);
      throw error;
    }
  }
  
  /**
   * Busca todas as reservas de um fazendeiro
   * @param {string} farmerId - ID do fazendeiro
   * @returns {Promise<Array>} - Lista de reservas do fazendeiro
   */
  async getFarmerReservations(farmerId) {
    try {
      // Primeiro, tente obter os dados com ordenação
      try {
        const q = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('farmerId', '==', farmerId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const reservations = [];
        querySnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        return reservations;
      } catch (indexError) {
        // Se falhar por falta de índice, tente sem a ordenação
        console.warn('Índice ausente para ordenação. Obtendo dados sem ordenação por data.', indexError);
        
        const fallbackQuery = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('farmerId', '==', farmerId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        const reservations = [];
        fallbackSnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        // Ordenar manualmente
        reservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return reservations;
      }
    } catch (error) {
      console.error('Erro ao buscar reservas do fazendeiro:', error);
      throw error;
    }
  }
  
  /**
   * Busca todas as reservas de um produto
   * @param {string} productId - ID do produto
   * @returns {Promise<Array>} - Lista de reservas do produto
   */
  async getProductReservations(productId) {
    try {
      // Primeiro, tente obter os dados com ordenação
      try {
        const q = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const reservations = [];
        querySnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        return reservations;
      } catch (indexError) {
        // Se falhar por falta de índice, tente sem a ordenação
        console.warn('Índice ausente para ordenação. Obtendo dados sem ordenação por data.', indexError);
        
        const fallbackQuery = query(
          collection(db, RESERVATIONS_COLLECTION),
          where('productId', '==', productId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        const reservations = [];
        fallbackSnapshot.forEach((doc) => {
          reservations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now()
          });
        });
        
        // Ordenar manualmente
        reservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return reservations;
      }
    } catch (error) {
      console.error('Erro ao buscar reservas do produto:', error);
      throw error;
    }
  }
  
  /**
   * Busca uma reserva pelo ID
   * @param {string} reservationId - ID da reserva
   * @returns {Promise<Object|null>} - A reserva encontrada ou null
   */
  async getReservationById(reservationId) {
    try {
      const reservationDoc = await getDoc(doc(db, RESERVATIONS_COLLECTION, reservationId));
      
      if (!reservationDoc.exists()) {
        return null;
      }
      
      return {
        id: reservationDoc.id,
        ...reservationDoc.data(),
        createdAt: reservationDoc.data().createdAt?.toMillis() || Date.now()
      };
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de uma reserva
   * @param {string} reservationId - ID da reserva
   * @param {string} status - Novo status (pending, approved, rejected, completed, cancelled)
   * @returns {Promise<void>}
   */
  async updateReservationStatus(reservationId, status) {
    try {
      await updateDoc(doc(db, RESERVATIONS_COLLECTION, reservationId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da reserva:', error);
      throw error;
    }
  }
  
  /**
   * Cancela uma reserva
   * @param {string} reservationId - ID da reserva
   * @returns {Promise<void>}
   */
  async cancelReservation(reservationId) {
    return this.updateReservationStatus(reservationId, 'cancelled');
  }
  
  /**
   * Aprova uma reserva e atualiza a quantidade do produto
   * @param {string} reservationId - ID da reserva
   * @returns {Promise<void>}
   */
  async approveReservation(reservationId) {
    try {
      // Buscar os detalhes da reserva
      const reservation = await this.getReservationById(reservationId);
      
      if (!reservation) {
        throw new Error('Reserva não encontrada');
      }
      
      // Buscar o produto para atualizar sua quantidade
      const product = await productService.getProductById(reservation.productId);
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      // Verificar se há quantidade suficiente
      const quantityToReserve = Number(reservation.quantity) || 0;
      const currentQuantity = Number(product.quantity) || 0;
      
      if (quantityToReserve > currentQuantity) {
        throw new Error('Quantidade insuficiente para aprovação da reserva');
      }
      
      // Atualizar o status da reserva
      await this.updateReservationStatus(reservationId, 'approved');
      
      // Atualizar a quantidade do produto
      const newQuantity = currentQuantity - quantityToReserve;
      await productService.updateProduct(product.id, {
        quantity: newQuantity,
        // Se a quantidade chegar a zero, marcar como indisponível
        isAvailable: newQuantity > 0
      });
      
      return {
        ...reservation,
        status: 'approved'
      };
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
      throw error;
    }
  }
  
  /**
   * Rejeita uma reserva
   * @param {string} reservationId - ID da reserva
   * @returns {Promise<void>}
   */
  async rejectReservation(reservationId) {
    return this.updateReservationStatus(reservationId, 'rejected');
  }
  
  /**
   * Marca uma reserva como concluída
   * @param {string} reservationId - ID da reserva
   * @returns {Promise<void>}
   */
  async completeReservation(reservationId) {
    return this.updateReservationStatus(reservationId, 'completed');
  }
}

export const reservationService = new ReservationService();