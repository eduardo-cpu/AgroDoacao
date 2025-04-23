import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, googleProvider, facebookProvider, db } from '../firebase/config';

// Criando o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Provider do contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userFarm, setUserFarm] = useState(null);

  // Função para cadastrar com email e senha
  async function signup(email, password, userData) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualiza o perfil do usuário com o nome
      await updateProfile(result.user, { displayName: userData.name });
      
      // Armazena os dados adicionais do usuário no Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        createdAt: new Date().toISOString()
      });
      
      // Dados específicos para produtores rurais
      if (userData.userType === 'farmer') {
        // Extrair as coordenadas para salvar separadamente
        const farmData = {
          id: result.user.uid,
          ownerId: result.user.uid,
          name: userData.farmName,
          location: userData.farmLocation,
          description: userData.farmDescription,
          contactPhone: userData.phone,
          preferredPickupTimes: userData.preferredPickupTimes,
          coordinates: userData.farmCoordinates || null,
          hasProducts: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'farms', result.user.uid), farmData);
        
        // Atualiza o estado do userFarm
        setUserFarm(farmData);
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      throw error;
    }
  }

  // Função para atualizar dados da fazenda
  async function updateFarmData(farmData) {
    if (!currentUser) throw new Error("Usuário não autenticado");
    
    try {
      // Garantir que o ID da fazenda seja definido como o UID do usuário
      const updatedData = {
        ...farmData,
        id: currentUser.uid,  // Garantir que o ID esteja definido
        ownerId: currentUser.uid,  // Garantir que o proprietário esteja definido
        updatedAt: new Date().toISOString()
      };
      
      // Se não houver createdAt, adiciona
      if (!updatedData.createdAt) {
        updatedData.createdAt = new Date().toISOString();
      }
      
      console.log("Atualizando dados da fazenda:", updatedData);
      
      const farmRef = doc(db, 'farms', currentUser.uid);
      await setDoc(farmRef, updatedData, { merge: true });
      
      console.log("Fazenda atualizada com sucesso");
      
      // Atualiza o estado local
      setUserFarm(prev => ({
        ...prev,
        ...updatedData
      }));
      
      return updatedData;
    } catch (error) {
      console.error("Erro ao atualizar dados da fazenda:", error);
      throw error;
    }
  }

  // Função para logar com email e senha
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função para completar registro após login social
  async function completeUserProfile(userData) {
    if (!currentUser) throw new Error("Usuário não autenticado");
    
    try {
      // Atualiza perfil do usuário
      await updateProfile(auth.currentUser, { 
        displayName: userData.name || auth.currentUser.displayName 
      });
      
      // Atualiza dados no Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await setDoc(userDocRef, {
        ...userData,
        uid: currentUser.uid,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Se for fazendeiro, cria documento da fazenda
      if (userData.userType === 'farmer') {
        const farmData = {
          id: currentUser.uid,
          ownerId: currentUser.uid,
          name: userData.farmName,
          location: userData.farmLocation,
          coordinates: userData.farmCoordinates || null,
          description: userData.farmDescription,
          contactPhone: userData.phone,
          preferredPickupTimes: userData.preferredPickupTimes,
          hasProducts: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'farms', currentUser.uid), farmData);
        
        // Atualiza estado do userFarm
        setUserFarm(farmData);
      }
      
      // Atualiza o usuário no contexto
      setCurrentUser(prev => ({
        ...prev,
        ...userData,
        displayName: userData.name || prev.displayName
      }));
      
      return true;
    } catch (error) {
      console.error("Erro ao completar perfil:", error);
      throw error;
    }
  }

  // Função para logar com Google
  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Verifica se o usuário já existe no Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      // Se não existir, cria o documento do usuário
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          userType: 'consumer', // Tipo padrão para login social
          createdAt: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao logar com Google:", error);
      throw error;
    }
  }
  
  // Função para logar com Facebook
  async function loginWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Verifica se o usuário já existe no Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      // Se não existir, cria o documento do usuário
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          userType: 'consumer', // Tipo padrão para login social
          createdAt: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao logar com Facebook:", error);
      throw error;
    }
  }
  
  // Função para sair
  function logout() {
    setUserFarm(null);
    return signOut(auth);
  }
  
  // Carrega os dados da fazenda do usuário se ele for produtor rural
  const loadFarmData = async (userId) => {
    try {
      const farmDoc = await getDoc(doc(db, 'farms', userId));
      
      if (farmDoc.exists()) {
        setUserFarm(farmDoc.data());
        return farmDoc.data();
      } else {
        setUserFarm(null);
        return null;
      }
    } catch (error) {
      console.error("Erro ao carregar dados da fazenda:", error);
      setUserFarm(null);
      return null;
    }
  };
  
  // Efeito para monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Se o usuário estiver autenticado, busca os dados adicionais do Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Combina os dados do auth com os dados do Firestore
            const enhancedUser = {
              ...user,
              ...userData
            };
            
            setCurrentUser(enhancedUser);
            
            // Se o usuário for produtor rural, carrega os dados da fazenda
            if (userData.userType === 'farmer') {
              await loadFarmData(user.uid);
            }
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserFarm(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userFarm,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    updateFarmData,
    completeUserProfile,
    loadFarmData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}