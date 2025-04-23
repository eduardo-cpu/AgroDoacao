import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';

const HomePage = () => {
  // Estado para controlar quando uma imagem não carrega
  const [imgError, setImgError] = useState({});

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (section) => {
    setImgError(prev => ({...prev, [section]: true}));
  };

  return (
    <main className="bg-background-light">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">AgroDoações</h1>
          <p className="text-xl text-white mb-8 leading-relaxed">
            Uma plataforma para conectar produtores rurais com pessoas e instituições
            que podem aproveitar produtos agrícolas que estão próximos da data de validade.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/produtos" className="px-6 py-3 bg-primary-green hover:bg-green-800 text-white font-medium rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse">
              Ver Produtos Disponíveis
            </Link>
            <Link to="/fazendas" className="px-6 py-3 bg-primary-green hover:bg-green-800 text-white font-medium rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Encontrar Fazendas
            </Link>
            <Link to="/auth" className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-primary-green">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-card p-6 transform transition hover:-translate-y-2 hover:shadow-card-hover">
              <div className="h-48 overflow-hidden rounded-lg mb-6">
                <img src="https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Fazenda" 
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('farm')}
                    style={{display: imgError.farm ? 'none' : 'block'}} />
                {imgError.farm && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl">🚜</span>
                  </div>
                )}
              </div>
              <div className="text-4xl mb-4">🚜</div>
              <h3 className="text-xl font-bold mb-3 text-primary-green">Produtores Cadastram Alimentos</h3>
              <p className="text-gray-600">
                Produtores rurais cadastram produtos que estão próximos da data de validade,
                indicando tipo, quantidade e localização da fazenda para coleta.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6 transform transition hover:-translate-y-2 hover:shadow-card-hover">
              <div className="h-48 overflow-hidden rounded-lg mb-6">
                <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Consumidores" 
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('consumers')}
                    style={{display: imgError.consumers ? 'none' : 'block'}} />
                {imgError.consumers && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl">🔍</span>
                  </div>
                )}
              </div>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3 text-primary-green">Consumidores Encontram Produtos</h3>
              <p className="text-gray-600 mb-6">
                Pessoas ou instituições localizam fazendas próximas e verificam os 
                produtos disponíveis para doação com suas datas de validade.
              </p>
              <Link to="/fazendas" className="text-primary-green hover:text-green-800 font-medium">
                Buscar fazendas próximas →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6 transform transition hover:-translate-y-2 hover:shadow-card-hover">
              <div className="h-48 overflow-hidden rounded-lg mb-6">
                <img 
                    src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Coleta" 
                    className="w-full h-full object-cover"
                    onError={() => handleImageError('collection')}
                    style={{display: imgError.collection ? 'none' : 'block'}} />
                {imgError.collection && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl">🌱</span>
                  </div>
                )}
              </div>
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-primary-green">Coleta e Aproveitamento</h3>
              <p className="text-gray-600">
                Os interessados utilizam o mapa para localizar as fazendas e coletar os produtos,
                evitando o desperdício e aproveitando alimentos de qualidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-primary-green">Benefícios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 h-full transform transition hover:-translate-y-1 hover:shadow-lg">
              <div className="text-4xl mb-4 text-primary-green">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Redução de Desperdício</h3>
              <p className="text-gray-600">
                Produtos agrícolas que seriam descartados por estarem próximos da data de validade são aproveitados.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 h-full transform transition hover:-translate-y-1 hover:shadow-lg">
              <div className="text-4xl mb-4 text-primary-green">🚜</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Apoio aos Produtores</h3>
              <p className="text-gray-600">
                Produtores rurais ganham visibilidade e evitam perdas financeiras com o desperdício.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 h-full transform transition hover:-translate-y-1 hover:shadow-lg">
              <div className="text-4xl mb-4 text-primary-green">📍</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Localização Facilitada</h3>
              <p className="text-gray-600">
                Sistema de localização que permite encontrar facilmente as fazendas para coletar os produtos.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 h-full transform transition hover:-translate-y-1 hover:shadow-lg">
              <div className="text-4xl mb-4 text-primary-green">📆</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Controle de Validade</h3>
              <p className="text-gray-600">
                Controle das datas de validade para garantir o aproveitamento responsável dos alimentos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-primary-green text-center">Nossa Missão</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Missão AgroDoações" 
                    className="w-full h-auto" />
              </div>
            </div>
            <div className="md:w-1/2">
              <p className="text-lg text-gray-700 leading-relaxed">
                A AgroDoações tem como missão reduzir o desperdício de alimentos 
                e garantir que produtos agrícolas que estão próximos do vencimento possam 
                chegar à mesa de quem precisa. Nossa plataforma conecta produtores 
                rurais com pessoas e instituições beneficiárias, promovendo sustentabilidade
                e responsabilidade social.
              </p>
            </div>
          </div>
          
          {/* CTA Box */}
          <div className="bg-primary-green rounded-2xl p-8 text-white text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-secondary-green text-white py-1 px-4 rounded-bl-lg font-bold text-sm">
              Novo
            </div>
            <h3 className="text-2xl font-bold mb-4">Faça Parte desta Comunidade!</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Seja você um produtor rural com produtos a doar ou um consumidor
              interessado em aproveitar alimentos de qualidade, junte-se a nós!
            </p>
            <Link to="/auth" className="inline-block bg-white text-primary-green font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-md hover:shadow-lg">
              Criar uma Conta
            </Link>
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiPjwvcmVjdD4KPC9zdmc+')]"></div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-green">500+</div>
              <div className="text-lg text-gray-300">Produtores</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-green">2.5 ton</div>
              <div className="text-lg text-gray-300">Alimentos Doados</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-green">50+</div>
              <div className="text-lg text-gray-300">Cidades</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-green">1.200+</div>
              <div className="text-lg text-gray-300">Usuários</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;