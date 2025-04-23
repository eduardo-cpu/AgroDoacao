import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './config';

const farmsCollection = collection(db, 'farms');

// Função auxiliar para verificar se o usuário está autenticado
const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

export const farmService = {
  // Criar ou atualizar uma fazenda
  async saveFarm(farmData) {
    try {
      const farmRef = doc(db, 'farms', farmData.id);
      
      const dataToSave = {
        ...farmData,
        updatedAt: new Date().toISOString(),
      };
      
      if (!farmData.createdAt) {
        dataToSave.createdAt = new Date().toISOString();
      }
      
      await setDoc(farmRef, dataToSave, { merge: true });
      return dataToSave;
    } catch (error) {
      console.error('Erro ao salvar fazenda:', error);
      throw error;
    }
  },
  
  // Obter todas as fazendas - com tratamento para erro de permissão
  async getAllFarms() {
    try {
      console.log('Buscando todas as fazendas...');
      // Tente obter todas as fazendas
      const querySnapshot = await getDocs(farmsCollection);
      
      console.log(`Encontradas ${querySnapshot.docs.length} fazendas no Firestore`);
      
      const farms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Dados da fazenda ${doc.id}:`, data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      return farms;
    } catch (error) {
      // Se houver erro de permissão, retorne apenas fazendas públicas ou uma lista vazia
      console.error('Erro ao buscar fazendas:', error);
      
      if (error.code === 'permission-denied') {
        console.log('Permissão negada. Retornando lista vazia de fazendas.');
        return [];
      }
      
      throw error;
    }
  },
  
  // Obter fazenda pelo ID
  async getFarmById(farmId) {
    try {
      const farmDoc = await getDoc(doc(db, 'farms', farmId));
      if (farmDoc.exists()) {
        return { id: farmDoc.id, ...farmDoc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar fazenda pelo ID:', error);
      throw error;
    }
  },
  
  // Obter fazenda pelo ID do proprietário
  async getFarmByOwnerId(ownerId) {
    try {
      const q = query(farmsCollection, where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const farmDoc = querySnapshot.docs[0];
        return { id: farmDoc.id, ...farmDoc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar fazenda pelo ID do proprietário:', error);
      throw error;
    }
  },
  
  // Obter todas as fazendas de um proprietário
  async getFarmsByOwnerId(ownerId) {
    try {
      const q = query(farmsCollection, where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      
      const farms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return farms;
    } catch (error) {
      console.error('Erro ao buscar fazendas do proprietário:', error);
      throw error;
    }
  },
  
  // Atualizar dados parciais da fazenda
  async updateFarm(farmId, updates) {
    try {
      const farmRef = doc(db, 'farms', farmId);
      await updateDoc(farmRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Retorna os dados atualizados
      return await this.getFarmById(farmId);
    } catch (error) {
      console.error('Erro ao atualizar fazenda:', error);
      throw error;
    }
  },
  
  // Excluir uma fazenda
  async deleteFarm(farmId) {
    try {
      await deleteDoc(doc(db, 'farms', farmId));
      return true;
    } catch (error) {
      console.error('Erro ao excluir fazenda:', error);
      throw error;
    }
  },

  // Criar nova fazenda com ID gerado
  async createFarm(farmData) {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Usuário não autenticado');
      
      const newFarmRef = doc(collection(db, 'farms'));
      
      const dataToSave = {
        ...farmData,
        id: newFarmRef.id,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(newFarmRef, dataToSave);
      return dataToSave;
    } catch (error) {
      console.error('Erro ao criar fazenda:', error);
      throw error;
    }
  }
};

export default farmService;