import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './config';
import productImageService from './productImageService';
import ImageSearchService from '../services/ImageSearchService';

const productsCollection = collection(db, 'products');

export const productService = {
  // Adicionar um novo produto
  async addProduct(productData) {
    try {
      // Buscar uma imagem para o produto pelo nome - usando o novo serviço que verifica no banco primeiro
      const productImage = await productImageService.getProductImageByName(productData.name);
      
      const newProductData = {
        ...productData,
        image: productImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(productsCollection, newProductData);
      
      // Retorna os dados do produto com o ID
      return {
        id: docRef.id,
        ...newProductData
      };
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  },
  
  // Buscar todos os produtos de uma fazenda
  async getProductsByFarm(farmId) {
    try {
      const q = query(productsCollection, where('farmId', '==', farmId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos da fazenda:', error);
      throw error;
    }
  },
  
  // Alias para manter compatibilidade com novos componentes
  async getProductsByFarmId(farmId) {
    return this.getProductsByFarm(farmId);
  },
  
  // Buscar todos os produtos disponíveis (de todas as fazendas)
  async getAllAvailableProducts() {
    try {
      const q = query(productsCollection, where('isAvailable', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos disponíveis:', error);
      throw error;
    }
  },
  
  // Buscar produto por ID
  async getProductById(productId) {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        return {
          id: productDoc.id,
          ...productDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      throw error;
    }
  },
  
  // Atualizar um produto
  async updateProduct(productId, updates) {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Se o nome do produto foi alterado, buscar nova imagem usando o novo serviço
      if (updates.name && updates.updateImage) {
        updates.image = await productImageService.getProductImageByName(updates.name);
      }
      
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Retornar o produto atualizado
      return await this.getProductById(productId);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },
  
  // Excluir um produto
  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  },
  
  // Buscar uma imagem para o produto pelo nome
  async getProductImage(productName) {
    try {
      return await productImageService.getProductImageByName(productName);
    } catch (error) {
      console.error('Erro ao buscar imagem para o produto:', error);
      // Retornar imagem placeholder em caso de erro
      return {
        url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`,
        thumbnail: `https://via.placeholder.com/100x100?text=${encodeURIComponent(productName)}`,
        alt: productName
      };
    }
  }
};

export default productService;