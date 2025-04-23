import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MapSelector from '../../components/MapSelector';
import './styles/AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { currentUser, login, signup, loginWithGoogle, loginWithFacebook } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'consumer',
    farmName: '',
    farmLocation: '',
    farmDescription: '',
    preferredPickupTimes: '',
    farmCoordinates: null
  });

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (coordinates, geocodeResult, addressDetails) => {
    console.log("Coordenadas recebidas:", coordinates);
    setUserData(prev => ({
      ...prev,
      farmCoordinates: coordinates,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        // Login com email e senha
        await login(userData.email, userData.password);
        navigate('/');
      } else {
        // Validar senha
        if (userData.password !== userData.confirmPassword) {
          throw new Error('As senhas não coincidem!');
        }
        
        // Se for produtor rural, verificar campos obrigatórios
        if (userData.userType === 'farmer') {
          if (!userData.farmName || !userData.farmLocation) {
            throw new Error('Preencha todos os campos obrigatórios da fazenda!');
          }

          // Validar se as coordenadas foram selecionadas
          if (!userData.farmCoordinates) {
            throw new Error('Por favor, selecione a localização da sua fazenda no mapa clicando em um ponto específico!');
          }
        }
        
        // Cadastro com email e senha
        await signup(userData.email, userData.password, {
          ...userData,
          // Formatar a localização da fazenda para incluir as coordenadas
          farmLocation: userData.userType === 'farmer' ? 
            `${userData.farmLocation} [Lat: ${userData.farmCoordinates?.lat.toFixed(6)}, Lng: ${userData.farmCoordinates?.lng.toFixed(6)}]` : 
            userData.farmLocation
        });
        
        navigate('/');
      }
    } catch (error) {
      console.error("Erro:", error);
      // Mapeia códigos de erro do Firebase para mensagens amigáveis
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha é muito fraca.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else {
        setError(error.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Erro ao logar com Google:", error);
      setError('Erro ao fazer login com o Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithFacebook();
      navigate('/');
    } catch (error) {
      console.error("Erro ao logar com Facebook:", error);
      setError('Erro ao fazer login com o Facebook. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-background-light py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary-green">
          {isLogin ? 'Entrar na sua Conta' : 'Criar Nova Conta'}
        </h1>
        
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`flex-1 py-3 px-4 text-center font-medium transition 
              ${isLogin 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-600 hover:text-primary-green'}`} 
            onClick={() => setIsLogin(true)}
            disabled={loading}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-center font-medium transition 
              ${!isLogin 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-600 hover:text-primary-green'}`} 
            onClick={() => setIsLogin(false)}
            disabled={loading}
          >
            Cadastro
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos exclusivos do cadastro */}
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                  Nome Completo
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={userData.name}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Telefone
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={userData.phone}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="userType" className="block text-gray-700 font-semibold mb-2">
                  Tipo de Usuário
                </label>
                <select 
                  id="userType" 
                  name="userType" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                  value={userData.userType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="consumer">Consumidor (busca produtos)</option>
                  <option value="farmer">Produtor Rural (doa produtos)</option>
                </select>
              </div>

              {/* Campos exclusivos para produtores rurais */}
              {userData.userType === 'farmer' && (
                <div className="border-t border-dashed border-gray-300 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-primary-green mb-6">Dados da Fazenda</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="farmName" className="block text-gray-700 font-semibold mb-2">
                        Nome da Fazenda/Propriedade
                      </label>
                      <input 
                        type="text" 
                        id="farmName" 
                        name="farmName" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                        value={userData.farmName}
                        onChange={handleChange}
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="farmLocation" className="block text-gray-700 font-semibold mb-2">
                        Localização Detalhada
                      </label>
                      <textarea 
                        id="farmLocation" 
                        name="farmLocation" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                        value={userData.farmLocation}
                        onChange={handleChange}
                        placeholder="Endereço completo com pontos de referência para facilitar a localização"
                        required 
                        rows="3"
                        disabled={loading}
                      ></textarea>
                    </div>

                    {/* Google Maps para selecionar localização */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-primary-green">
                        Selecione a localização no mapa (obrigatório)
                      </label>
                      
                      <div className="border-2 border-primary-green rounded-lg p-4 bg-green-50">
                        <div className="bg-green-100 p-4 rounded-lg mb-4 border border-green-300">
                          <p className="font-bold text-green-800 flex items-center mb-1">
                            <span className="mr-1">⚠️</span> IMPORTANTE: Para cadastrar sua fazenda, você precisa definir sua localização exata no mapa.
                          </p>
                          <p className="text-green-700">
                            Busque seu endereço ou clique diretamente no mapa no ponto correto de sua propriedade.
                          </p>
                        </div>
                        
                        <div className="rounded-lg overflow-hidden border border-gray-300">
                          <MapSelector 
                            initialPosition={userData.farmCoordinates}
                            onSelectLocation={handleLocationSelect}
                          />
                        </div>
                        
                        {userData.farmCoordinates ? (
                          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                            <p className="flex items-center font-semibold">
                              <span className="mr-1">✅</span> Localização selecionada com sucesso:
                            </p>
                            <p className="mt-1">
                              {userData.farmCoordinates.lat.toFixed(6)}, {userData.farmCoordinates.lng.toFixed(6)}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-300">
                            <p className="flex items-center font-semibold">
                              <span className="mr-1">⚠️</span> Você ainda não selecionou uma localização no mapa. 
                            </p>
                            <p className="mt-1">
                              Clique em um ponto no mapa para marcar.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="farmDescription" className="block text-gray-700 font-semibold mb-2">
                        Descrição da Produção
                      </label>
                      <textarea 
                        id="farmDescription" 
                        name="farmDescription" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                        value={userData.farmDescription}
                        onChange={handleChange}
                        placeholder="Descreva os tipos de produtos que você cultiva"
                        rows="3"
                        disabled={loading}
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="preferredPickupTimes" className="block text-gray-700 font-semibold mb-2">
                        Horários Preferenciais para Coleta
                      </label>
                      <input 
                        type="text" 
                        id="preferredPickupTimes" 
                        name="preferredPickupTimes" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                        value={userData.preferredPickupTimes}
                        onChange={handleChange}
                        placeholder="Ex: Seg a Sex, das 8h às 17h"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Campos comuns */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              E-mail
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={userData.email}
              onChange={handleChange}
              required 
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Senha
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
              value={userData.password}
              onChange={handleChange}
              required 
              disabled={loading}
            />
          </div>
          
          {/* Campo de confirmação de senha exclusivo do cadastro */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                Confirmar Senha
              </label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition"
                value={userData.confirmPassword}
                onChange={handleChange}
                required 
                disabled={loading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className={`w-full bg-primary-green text-white py-3 px-6 rounded-lg font-medium transition hover:bg-green-800 shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        
        {isLogin && (
          <p className="text-center mt-4 text-sm">
            <Link to="/recuperar-senha" className="text-primary-green hover:text-green-800 font-medium">
              Esqueceu sua senha?
            </Link>
          </p>
        )}
        
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <span className="bg-white px-3 relative text-gray-500 text-sm">OU</span>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button 
            onClick={handleFacebookLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
            </svg>
            Entrar com Facebook
          </button>
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;