import axios from 'axios';

// Google Custom Search API
const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY; 
const GOOGLE_CX = process.env.REACT_APP_GOOGLE_CX;

// Categorias de produtos agrícolas para refinamento da busca
const AGRICULTURAL_CATEGORIES = [
  'fruta',
  'legume',
  'verdura',
  'hortalica',
  'cereal',
  'graos'
];

// Mapeamento de produtos comuns para URLs de imagens estáticas
const staticProductImages = {
  banana: {
    url: 'https://images.unsplash.com/photo-1571771894286-0a3f5694e744?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1571771894286-0a3f5694e744?w=200&q=80',
    alt: 'Bananas'
  },
  laranja: {
    url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9041d75?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1611080626919-7cf5a9041d75?w=200&q=80',
    alt: 'Laranjas'
  },
  maca: {
    url: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=200&q=80',
    alt: 'Maçãs'
  },
  tomate: {
    url: 'https://images.unsplash.com/photo-1561136594-7860db70183d?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1561136594-7860db70183d?w=200&q=80',
    alt: 'Tomates'
  },
  cenoura: {
    url: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?w=200&q=80',
    alt: 'Cenouras'
  },
  batata: {
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80',
    alt: 'Batatas'
  },
  alface: {
    url: 'https://images.unsplash.com/photo-1622206151242-8f5e7028e2c2?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1622206151242-8f5e7028e2c2?w=200&q=80',
    alt: 'Alface'
  },
  milho: {
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80',
    alt: 'Milho'
  },
  feijao: {
    url: 'https://images.unsplash.com/photo-1604228741406-a789d5d37bc0?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1604228741406-a789d5d37bc0?w=200&q=80',
    alt: 'Feijão'
  },
  arroz: {
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
    alt: 'Arroz'
  }
};

// Normalize o nome do produto para usar em pesquisas
const normalizeProductName = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '-');
};

// Determinar a categoria agrícola do produto para melhorar a busca
const determineProductCategory = (productName) => {
  const name = productName.toLowerCase();
  
  // Lista de frutas comuns
  const fruits = [
    'banana', 'maça', 'maca', 'laranja', 'uva', 'mamao', 'mamão', 'abacaxi', 'melancia', 
    'manga', 'pera', 'limao', 'limão', 'goiaba', 'kiwi', 'morango', 'cereja', 'ameixa', 
    'pêssego', 'pessego', 'abacate', 'caqui', 'figo', 'maracuja', 'maracujá'
  ];
  
  // Lista de legumes comuns
  const vegetables = [
    'batata', 'cenoura', 'beterraba', 'abobora', 'abóbora', 'mandioca', 'batata-doce',
    'inhame', 'cará', 'cara', 'nabo', 'rabanete', 'berinjela', 'chuchu', 'abobrinha',
    'pepino', 'quiabo', 'pimentao', 'pimentão', 'vagem', 'tomate', 'milho'
  ];
  
  // Lista de verduras comuns
  const greens = [
    'alface', 'espinafre', 'couve', 'repolho', 'rucula', 'rúcula', 'agriao', 'agrião',
    'chicoria', 'chicória', 'acelga', 'escarola', 'brocolis', 'brócolis', 'couve-flor',
    'salsa', 'cebolinha', 'coentro', 'manjericao', 'manjericão', 'alho-poro'
  ];
  
  // Lista de cereais comuns
  const grains = [
    'arroz', 'feijao', 'feijão', 'soja', 'trigo', 'milho', 'aveia', 'centeio',
    'cevada', 'sorgo', 'quinoa', 'lentilha', 'grao-de-bico', 'grão-de-bico'
  ];
  
  if (fruits.some(fruit => name.includes(fruit))) {
    return 'fruta';
  } else if (vegetables.some(veg => name.includes(veg))) {
    return 'legume';
  } else if (greens.some(green => name.includes(green))) {
    return 'verdura';
  } else if (grains.some(grain => name.includes(grain))) {
    return 'graos';
  }
  
  // Se não conseguir determinar com precisão, retorna uma categoria geral
  return 'alimento agrícola';
};

const ImageSearchService = {
  // Busca imagens para um produto usando a API do Google
  async searchProductImages(productName) {
    try {
      if (!productName) {
        throw new Error('Nome do produto não fornecido');
      }

      // Determinar a categoria do produto para refinar a busca
      const productCategory = determineProductCategory(productName);
      
      // Configurações de busca precisas para diferentes categorias
      const preciseBusca = {
        'fruta': `"${productName}" fruta fresca`,
        'legume': `"${productName}" legume fresco`,
        'verdura': `"${productName}" verdura fresca`,
        'graos': `"${productName}" grão cereal`
      };
      
      // Usar aspas para encontrar exatamente o termo pesquisado
      // O uso de aspas obriga o Google a buscar exatamente aquele termo
      const searchTerm = preciseBusca[productCategory] || 
        `"${productName}" produto agrícola fresco`;
      
      // Adicionamos termos negativos para excluir resultados indesejados
      const excludeTerms = '-logotipo -clipart -animação -ilustração -desenho -animado';
      const fullQuery = `${searchTerm} ${excludeTerms}`;

      console.log(`Buscando imagens precisas no Google para: "${fullQuery}"`);
      
      // Verificar se as chaves de API estão configuradas
      if (GOOGLE_API_KEY === 'SUA_API_KEY_GOOGLE' || GOOGLE_CX === 'SEU_SEARCH_ENGINE_ID') {
        console.warn('API Key do Google ou Search Engine ID não configurados. Use valores reais para estas constantes.');
        throw new Error('API Google não configurada');
      }

      // Fazer a requisição para a API do Google Custom Search com parâmetros otimizados
      const response = await axios.get(GOOGLE_SEARCH_API_URL, {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CX,
          q: fullQuery,
          searchType: 'image',
          num: 10, // Número de resultados
          imgType: 'photo', // Apenas fotos, não ilustrações ou cliparts
          imgSize: 'large', // Imagens grandes para melhor qualidade
          imgColorType: 'color', // Apenas imagens coloridas
          imgDominantColor: 'white', // Fundo branco ou claro, comum em produtos
          safe: 'active', // SafeSearch ativado
          rights: 'cc_publicdomain cc_attribute cc_sharealike', // Imagens com licenças mais permissivas
          filter: '1' // Filtro para resultados mais relevantes
        }
      });

      // Verificar se temos resultados válidos
      if (response.data && response.data.items && response.data.items.length > 0) {
        console.log(`Encontradas ${response.data.items.length} imagens precisas no Google para "${productName}"`);
        
        // Ordenar os resultados para priorizar imagens mais relevantes
        // Aquelas com o termo de busca exato no título têm prioridade
        const sortedResults = response.data.items.sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          
          // Dar prioridade para imagens que contenham exatamente o nome do produto no título
          const aHasExactName = aTitle.includes(productName.toLowerCase());
          const bHasExactName = bTitle.includes(productName.toLowerCase());
          
          if (aHasExactName && !bHasExactName) return -1;
          if (!aHasExactName && bHasExactName) return 1;
          
          return 0;
        });
        
        // Retornar os resultados transformados e ordenados
        return sortedResults.map(item => ({
          url: item.link,
          thumbnail: item.image.thumbnailLink,
          alt: `${productName} - produto agrícola`,
          source: 'google',
          title: item.title,
          sourceUrl: item.image.contextLink,
          width: item.image.width,
          height: item.image.height
        }));
      }

      // Se a busca precisa falhar, tenta uma busca mais ampla
      console.log('Busca precisa falhou, tentando busca mais ampla...');
      const genericResponse = await axios.get(GOOGLE_SEARCH_API_URL, {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CX,
          q: `${productName} alimento`,
          searchType: 'image',
          num: 5,
          imgType: 'photo',
          safe: 'active'
        }
      });

      if (genericResponse.data && genericResponse.data.items && genericResponse.data.items.length > 0) {
        console.log(`Encontradas ${genericResponse.data.items.length} imagens na busca genérica`);
        
        return genericResponse.data.items.map(item => ({
          url: item.link,
          thumbnail: item.image.thumbnailLink,
          alt: productName,
          source: 'google',
          title: item.title,
          sourceUrl: item.image.contextLink
        }));
      }

      console.log('Nenhuma imagem encontrada no Google, usando placeholder');
      
      // Se nenhuma busca funcionou, use um placeholder com o nome do produto
      return [{
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(productName)}`,
        thumbnail: `https://via.placeholder.com/200x150?text=${encodeURIComponent(productName)}`,
        alt: productName
      }];
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      
      // Em caso de erro, retorna uma imagem de placeholder
      return [{
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(productName || 'Produto')}`,
        thumbnail: `https://via.placeholder.com/200x150?text=${encodeURIComponent(productName || 'Produto')}`,
        alt: productName || 'Produto'
      }];
    }
  }
};

export default ImageSearchService;