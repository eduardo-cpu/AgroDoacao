// Configuração centralizada para o Google Maps
// Esta configuração deve ser usada em todos os componentes que utilizam a API do Google Maps

// Array de bibliotecas que serão usadas em toda a aplicação
export const libraries = ['places', 'geometry'];

// Configurações padrão para o carregamento da API do Google Maps
export const mapsApiConfig = {
  id: 'google-map-script',
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: libraries,
  language: 'pt-BR',  // Definindo português como idioma padrão
  region: 'BR'        // Definindo Brasil como região padrão
};

// Estilos padrão para containers de mapas
export const defaultMapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Centro padrão para mapas (Brasil)
export const defaultMapCenter = {
  lat: -15.7801,
  lng: -47.9292
};

// Níveis de zoom padrão
export const defaultZoomLevels = {
  country: 4,
  region: 6,
  city: 10,
  street: 15
};

// Função utilitária para verificar se uma chave de API é válida
export const isValidApiKey = (apiKey) => {
  return apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
};