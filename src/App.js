import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
// Importação dos arquivos CSS separados
import './styles/base.css';
import './styles/navbar.css';
import './styles/buttons.css';
import './styles/cards.css';
import './styles/forms.css';
import './styles/layout.css';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Lazy loading of pages for better performance
const HomePage = React.lazy(() => import('./pages/Home/HomePage'));
const ProductsPage = React.lazy(() => import('./pages/Products/ProductsPage'));
const AuthPage = React.lazy(() => import('./pages/Auth/AuthPage'));
const FarmPage = React.lazy(() => import('./pages/Farm/FarmPage'));
const FarmSetupPage = React.lazy(() => import('./pages/Farm/FarmSetupPage'));
const FarmListPage = React.lazy(() => import('./pages/Farm/FarmListPage'));
const FarmDetailsPage = React.lazy(() => import('./pages/Farm/FarmDetailsPage'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));
const MyFarmsPage = React.lazy(() => import('./pages/Farm/MyFarmsPage'));
const FarmProductsPage = React.lazy(() => import('./pages/Farm/FarmProductsPage'));
const NewFarmPage = React.lazy(() => import('./pages/Farm/NewFarmPage'));
const AddProductPage = React.lazy(() => import('./pages/Farm/AddProductPage'));
const EditProductPage = React.lazy(() => import('./pages/Farm/EditProductPage'));
const ReservationsPage = React.lazy(() => import('./pages/Profile/ReservationsPage'));
const FarmerReservationsPage = React.lazy(() => import('./pages/Profile/FarmerReservationsPage'));

// Componente para a Navbar com autenticação
function Navbar() {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Não precisa redirecionar, o AuthProvider vai fazer isso automaticamente
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-logo">AgroDoações</div>
      <ul className="navbar-links">
        <li><Link to="/">Início</Link></li>
        <li><Link to="/produtos">Produtos Disponíveis</Link></li>
        <li><Link to="/fazendas">Fazendas</Link></li>

        {currentUser ? (
          <li className="user-dropdown">
            <button 
              className="dropdown-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{currentUser.displayName || currentUser.name || currentUser.email}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                {/* Se for consumidor - apenas Minhas Reservas */}
                {currentUser.userType === 'consumer' && (
                  <Link to="/minhas-reservas">Minhas Reservas</Link>
                )}
                
                {/* Se for agricultor - apenas Gerenciar Reservas e Minhas Fazendas */}
                {currentUser.userType === 'farmer' && (
                  <>
                    <Link to="/minhas-fazendas">Minhas Fazendas</Link>
                    <Link to="/gerenciar-reservas">Gerenciar Reservas</Link>
                  </>
                )}
                <button onClick={handleLogout} className="logout-button">
                  Sair
                </button>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/auth">Entrar/Cadastrar</Link></li>
        )}
      </ul>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          
          <React.Suspense fallback={<div className="loading">Carregando...</div>}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/fazendas" element={<FarmListPage />} />
              <Route path="/fazendas/:id" element={<FarmDetailsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Rotas protegidas para todos os usuários autenticados */}
              <Route element={<PrivateRoute />}>
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
              
              {/* Rotas protegidas para agricultores */}
              <Route element={<PrivateRoute requiredRoles={['farmer']} />}>
                <Route path="/minha-fazenda" element={<FarmPage />} />
                <Route path="/minhas-fazendas" element={<MyFarmsPage />} />
                <Route path="/farm/new" element={<NewFarmPage />} />
                <Route path="/farm/:farmId/products" element={<FarmProductsPage />} />
                <Route path="/farm/:farmId/product/new" element={<AddProductPage />} />
                <Route path="/farm/:farmId/product/:productId/edit" element={<EditProductPage />} />
                <Route path="/meus-produtos" element={<div>Meus Produtos</div>} />
                <Route path="/profile/farm-setup" element={<FarmSetupPage />} />
                <Route path="/gerenciar-reservas" element={<FarmerReservationsPage />} />
              </Route>
              
              {/* Rotas protegidas para consumidores */}
              <Route element={<PrivateRoute requiredRoles={['consumer']} />}>
                <Route path="/minhas-coletas" element={<div>Minhas Coletas</div>} />
                <Route path="/minhas-reservas" element={<ReservationsPage />} />
              </Route>
              
              {/* Rota para página não encontrada */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>

          <footer className="app-footer">
            <p>&copy; 2025 AgroDoações - Plataforma de doação de produtos agrícolas</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
