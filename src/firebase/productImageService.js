import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from './config';
import ImageSearchService from '../services/ImageSearchService';

const productImagesCollection = collection(db, 'productImages');

export const productImageService = {
  /**
   * Busca uma imagem para o produto pelo nome.
   * Sempre busca imagens dinâmicas via API.
   * Os resultados são salvos no banco de dados para futuros usos.
   */
  async getProductImageByName(productName) {
    try {
      if (!productName) {
        throw new Error('Nome do produto não fornecido');
      }

      // Sempre buscar uma nova imagem via API
      console.log(`Buscando imagem via API para "${productName}"...`);
      const imageResults = await ImageSearchService.searchProductImages(productName);
      
      if (imageResults && imageResults.length > 0) {
        const bestImage = imageResults[0];
        
        // Salva a imagem no banco para uso futuro
        const normalizedName = this.normalizeProductName(productName);
        await this.saveProductImage(normalizedName, productName, bestImage);
        
        return bestImage;
      }
      
      // Se não conseguiu obter nenhuma imagem da API
      return {
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(productName)}`,
        thumbnail: `https://via.placeholder.com/200x150?text=${encodeURIComponent(productName)}`,
        alt: productName
      };
      
    } catch (error) {
      console.error('Erro ao buscar imagem do produto:', error);
      return {
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(productName || 'Produto')}`,
        thumbnail: `https://via.placeholder.com/200x150?text=${encodeURIComponent(productName || 'Produto')}`,
        alt: productName || 'Produto'
      };
    }
  },
  
  /**
   * Salva uma imagem de produto no banco de dados
   */
  async saveProductImage(normalizedName, originalName, imageData) {
    try {
      const imageId = normalizedName;
      const imageRef = doc(productImagesCollection, imageId);
      
      await setDoc(imageRef, {
        normalizedName,
        originalName,
        image: imageData,
        createdAt: new Date().toISOString()
      });
      
      console.log(`Imagem para "${originalName}" salva no banco de dados`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar imagem do produto:', error);
      return false;
    }
  },
  
  /**
   * Normaliza o nome do produto para usar como chave de busca
   */
  normalizeProductName(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '-') // Substitui caracteres não alfanuméricos por hífen
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e no fim
  }
};

export default productImageService;