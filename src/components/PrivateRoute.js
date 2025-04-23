import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ requiredRoles = [] }) {
  const { currentUser } = useAuth();
  
  // Se não estiver autenticado, redireciona para login
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  // Se houver papéis requeridos, verifica se o usuário tem o papel necessário
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.userType)) {
    return <Navigate to="/" replace />;
  }
  
  // Se estiver autenticado e tem o papel correto (ou nenhum papel específico é requerido), renderiza o componente
  return <Outlet />;
}