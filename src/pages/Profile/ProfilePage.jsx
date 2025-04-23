import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import notificationService from '../../firebase/notificationService';
import productService from '../../firebase/productService';
import { useNavigate } from 'react-router-dom';
import './styles/ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, userFarm, loadFarmData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Ensure farm data loaded for farmer
  useEffect(() => {
    if (currentUser?.userType === 'farmer' && !userFarm) {
      loadFarmData(currentUser.uid);
    }
  }, [currentUser, userFarm, loadFarmData]);

  // Load notifications and products when farm is available
  useEffect(() => {
    if (userFarm) {
      notificationService.getNotificationsByFarm(userFarm.id).then(data => setNotifications(data));
      productService.getProductsByFarm(userFarm.id).then(data => setProducts(data));
    }
  }, [userFarm]);

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(notifs => notifs.filter(n => n.id !== id));
  };

  // Handle form field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  // Add new product
  const handleAddProduct = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!newProduct.name) throw new Error('Informe o nome do produto');
      const data = {
        farmId: userFarm.id,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        isAvailable: true
      };
      await productService.addProduct(data);
      const updated = await productService.getProductsByFarm(userFarm.id);
      setProducts(updated);
      setSuccess('Produto adicionado com sucesso');
      setNewProduct({ name: '', description: '', price: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <p>Carregando perfil...</p>;
  if (currentUser.userType !== 'farmer') return <p>Acesso restrito a produtores rurais.</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil - {currentUser.displayName || currentUser.name}</h1>
      {userFarm ? (
        <div>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Minha Fazenda</h2>
            <p><strong>Nome:</strong> {userFarm.name}</p>
            <p><strong>Localização:</strong> {userFarm.location}</p>
            <button onClick={() => navigate('/profile/farm-setup')} className="btn-primary mt-2">Editar Fazeda</button>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Notificações</h2>
            {notifications.length ? (
              <ul>
                {notifications.map(n => (
                  <li key={n.id} className="border p-2 mb-2">
                    <p>{n.message}</p>
                    <button onClick={() => handleMarkAsRead(n.id)} className="text-sm text-blue-600">Marcar como lida</button>
                  </li>
                ))}
              </ul>
            ) : <p>Nenhuma notificação.</p>}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Meus Produtos</h2>
            <form onSubmit={handleAddProduct} className="mb-4">
              {error && <p className="text-red-600">{error}</p>}
              {success && <p className="text-green-600">{success}</p>}
              <div className="form-group">
                <input name="name" value={newProduct.name} onChange={handleChange} placeholder="Nome do produto" className="form-control mb-2" />
              </div>
              <div className="form-group">
                <input name="price" value={newProduct.price} onChange={handleChange} placeholder="Preço" type="number" step="0.01" className="form-control mb-2" />
              </div>
              <div className="form-group">
                <input name="description" value={newProduct.description} onChange={handleChange} placeholder="Descrição" className="form-control mb-2" />
              </div>
              <button type="submit" disabled={loading} className="form-button">
                {loading ? 'Adicionando...' : 'Adicionar Produto'}
              </button>
            </form>
            {products.length ? (
              <ul>
                {products.map(p => (
                  <li key={p.id} className="mb-2">
                    <p><strong>{p.name}</strong> - R$ {(p.price ?? 0).toFixed(2)}</p>
                    <p>{p.description}</p>
                  </li>
                ))}
              </ul>
            ) : <p>Sem produtos cadastrados.</p>}
          </section>
        </div>
      ) : (
        <p>Ainda não há fazenda cadastrada. <button onClick={() => navigate('/profile/farm-setup')} className="text-blue-600">Cadastre sua fazenda</button></p>
      )}
    </div>
  );
};

export default ProfilePage;