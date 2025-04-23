import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { 
  mapsApiConfig, 
  defaultMapContainerStyle, 
  defaultMapCenter,
  isValidApiKey
} from '../services/googleMapsConfig';

const MapSelector = ({
  initialPosition = null,
  initialAddress = '',
  onSelectLocation,
  containerStyle = defaultMapContainerStyle,
  zoom = 5
}) => {
  // Estado para armazenar a posição selecionada
  const [markerPosition, setMarkerPosition] = useState(initialPosition);
  // Estado para armazenar o endereço de busca
  const [searchAddress, setSearchAddress] = useState(initialAddress);
  // Estado para armazenar o endereço formatado retornado pela geocodificação reversa
  const [addressDetails, setAddressDetails] = useState(null);
  // Estado para controlar o carregamento da geocodificação
  const [isGeocoding, setIsGeocoding] = useState(false);
  // Estado para controlar o modo de emergência (quando a API não está disponível)
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Referência para o serviço de geocodificação
  const geocoderRef = useRef(null);
  
  // Verifica se a chave da API é o placeholder
  const apiKeyIsPlaceholder = !isValidApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  
  // Carrega a API do Google Maps usando a configuração centralizada
  const { isLoaded, loadError } = useJsApiLoader(mapsApiConfig);
  
  // Inicializa o serviço de geocodificação quando a API for carregada
  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder();
      } catch (error) {
        console.error("Erro ao inicializar o serviço de geocodificação:", error);
        setEmergencyMode(true);
      }
    }
    
    // Se houver erro de carregamento ou a chave for um placeholder, ativa o modo de emergência
    if (loadError || apiKeyIsPlaceholder) {
      setEmergencyMode(true);
    }
  }, [isLoaded, loadError, apiKeyIsPlaceholder]);

  // Função para geocodificar um endereço
  const geocodeAddress = useCallback(() => {
    if (emergencyMode) {
      alert('Funcionalidade de busca de endereço não está disponível sem uma chave de API válida do Google Maps.');
      return;
    }
    
    if (!searchAddress.trim() || !geocoderRef.current) return;
    
    setIsGeocoding(true);
    
    geocoderRef.current.geocode({ address: searchAddress }, (results, status) => {
      setIsGeocoding(false);
      
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newPosition = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setMarkerPosition(newPosition);
        
        // Obter detalhes do endereço
        extractAddressComponents(results[0]);
        
        if (onSelectLocation) {
          onSelectLocation(newPosition, results[0]);
        }
      } else {
        alert('Não foi possível encontrar o endereço: ' + status);
      }
    });
  }, [searchAddress, onSelectLocation, emergencyMode]);

  // Função para extrair os componentes do endereço
  const extractAddressComponents = useCallback((result) => {
    if (!result) return;
    
    const addressComponents = result.address_components;
    const formattedAddress = result.formatted_address;
    
    const details = {
      formattedAddress,
      street: '',
      streetNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    };
    
    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('route')) {
        details.street = component.long_name;
      }
      
      if (types.includes('street_number')) {
        details.streetNumber = component.long_name;
      }
      
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        details.neighborhood = component.long_name;
      }
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        details.city = component.long_name;
      }
      
      if (types.includes('administrative_area_level_1')) {
        details.state = component.short_name;
      }
      
      if (types.includes('postal_code')) {
        details.postalCode = component.long_name;
      }
      
      if (types.includes('country')) {
        details.country = component.long_name;
      }
    });
    
    setAddressDetails(details);
    
    return details;
  }, []);

  // Função para geocodificação reversa
  const reverseGeocode = useCallback((lat, lng) => {
    if (emergencyMode) {
      if (onSelectLocation) {
        onSelectLocation({ lat, lng }, null, null);
      }
      return;
    }
    
    if (!geocoderRef.current) return;
    
    setIsGeocoding(true);
    
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      setIsGeocoding(false);
      
      if (status === 'OK' && results[0]) {
        setSearchAddress(results[0].formatted_address);
        
        // Obter detalhes do endereço
        const details = extractAddressComponents(results[0]);
        
        if (onSelectLocation) {
          onSelectLocation({ lat, lng }, results[0], details);
        }
      } else {
        console.error('Erro na geocodificação reversa:', status);
        
        // Mesmo com erro, ainda enviar as coordenadas para o componente pai
        if (onSelectLocation) {
          onSelectLocation({ lat, lng }, null, null);
        }
      }
    });
  }, [extractAddressComponents, onSelectLocation, emergencyMode]);
  
  // Callback para quando o usuário clica no mapa
  const handleClick = useCallback((event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setMarkerPosition(newPosition);
    
    // Realizar geocodificação reversa para obter o endereço
    reverseGeocode(newPosition.lat, newPosition.lng);
  }, [reverseGeocode]);
  
  // Função para lidar com cliques no modo de emergência
  const handleEmergencyMapClick = (e) => {
    // Obtém as coordenadas do clique no div
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simula coordenadas baseadas na posição relativa do clique
    // Isso é apenas uma simulação simples para fins de demonstração
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    
    // Vamos simular coordenadas no Brasil
    const lat = -34 + (y / height) * 34; // De -34 a 0 (sul para norte)
    const lng = -73 + (x / width) * 43;  // De -73 a -30 (oeste para leste)
    
    const newPosition = { lat, lng };
    setMarkerPosition(newPosition);
    
    // Notificar o componente pai sobre a seleção
    if (onSelectLocation) {
      onSelectLocation(newPosition, null, null);
    }
  };
  
  // Renderiza mensagens de erro ou carregamento
  if (loadError || emergencyMode) {
    return (
      <div className="map-selector">
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
            {apiKeyIsPlaceholder ? 
              'Chave de API do Google Maps não configurada. Por favor, configure uma chave válida no arquivo .env.' : 
              'Não foi possível carregar o mapa. Usando modo alternativo.'}
          </p>
          <p>Você ainda pode selecionar um local clicando no mapa simplificado abaixo:</p>
        </div>
        
        <div 
          className="emergency-map" 
          style={{ 
            width: containerStyle.width, 
            height: containerStyle.height,
            backgroundColor: '#e8f5e9',
            border: '1px solid #2e7d32',
            borderRadius: '8px',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Cpath d=\'M10 10 L190 10 L190 190 L10 190 Z\' fill=\'none\' stroke=\'%232e7d32\' stroke-width=\'1\'/%3E%3Cpath d=\'M10 10 L190 190 M10 190 L190 10\' stroke=\'%232e7d32\' stroke-width=\'0.5\' stroke-dasharray=\'5,5\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            position: 'relative',
            cursor: 'crosshair'
          }} 
          onClick={handleEmergencyMapClick}
        >
          {markerPosition && (
            <div 
              style={{
                position: 'absolute',
                left: `${(markerPosition.lng + 73) / 43 * 100}%`,
                top: `${(markerPosition.lat + 34) / 34 * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '50%',
                border: '2px solid white',
                zIndex: 2
              }}
            />
          )}
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '4px' }}>
            Mapa Simplificado do Brasil
          </div>
        </div>
        
        {markerPosition && (
          <div className="coordinates-display mt-2 text-sm text-gray-500">
            <p>Latitude: {markerPosition.lat.toFixed(6)}</p>
            <p>Longitude: {markerPosition.lng.toFixed(6)}</p>
          </div>
        )}
        
        <p className="help-text mt-2 text-sm text-gray-500">
          Clique no mapa acima para marcar a localização da sua fazenda.
        </p>
      </div>
    );
  }
  
  if (!isLoaded) return <div className="loading-placeholder">Carregando mapa...</div>;
  
  return (
    <div className="map-selector">
      <div className="address-search mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-input"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Digite um endereço para buscar"
            onKeyPress={(e) => e.key === 'Enter' && geocodeAddress()}
          />
          <button 
            className="btn-primary" 
            onClick={geocodeAddress}
            disabled={isGeocoding}
          >
            {isGeocoding ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        <small className="text-gray-500">
          Busque pelo endereço ou clique diretamente no mapa para selecionar a localização.
        </small>
      </div>
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultMapCenter}
        zoom={zoom}
        onClick={handleClick}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={(e) => {
              const newPosition = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              setMarkerPosition(newPosition);
              // Realizar geocodificação reversa para obter o endereço
              reverseGeocode(newPosition.lat, newPosition.lng);
            }}
          />
        )}
      </GoogleMap>
      
      {addressDetails && (
        <div className="address-details mt-3 text-sm">
          <h3 className="font-semibold mb-1">Detalhes do endereço:</h3>
          <p className="mb-1">{addressDetails.formattedAddress}</p>
          
          {(addressDetails.street || addressDetails.streetNumber) && (
            <p className="text-gray-600">
              {`${addressDetails.street}${addressDetails.streetNumber ? ', ' + addressDetails.streetNumber : ''}`}
            </p>
          )}
          
          {addressDetails.neighborhood && (
            <p className="text-gray-600">
              Bairro: {addressDetails.neighborhood}
            </p>
          )}
          
          {(addressDetails.city || addressDetails.state) && (
            <p className="text-gray-600">
              {`${addressDetails.city}${addressDetails.state ? ' - ' + addressDetails.state : ''}`}
              {addressDetails.postalCode ? `, CEP: ${addressDetails.postalCode}` : ''}
            </p>
          )}
        </div>
      )}
      
      {markerPosition && (
        <div className="coordinates-display mt-2 text-sm text-gray-500">
          <p>Latitude: {markerPosition.lat.toFixed(6)}</p>
          <p>Longitude: {markerPosition.lng.toFixed(6)}</p>
        </div>
      )}
      
      <p className="help-text mt-2 text-sm text-gray-500">
        Clique no mapa para marcar a localização da sua fazenda ou arraste o marcador para ajustar.
      </p>
    </div>
  );
};

export default MapSelector;