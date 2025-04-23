# 🌱 AgroDoação

## Sobre o Projeto

AgroDoação é uma plataforma web desenvolvida para conectar produtores rurais com organizações e indivíduos que necessitam de alimentos. O objetivo principal é reduzir o desperdício de alimentos, permitindo que fazendeiros doem produtos agrícolas que estão próximos da data de validade, mas ainda em perfeitas condições para consumo.

## 📋 Funcionalidades Principais

- **Cadastro e Autenticação**
  - Cadastro de produtores rurais e receptores de doações
  - Login com e-mail/senha, Google e Facebook
  - Recuperação de senha
  - Perfis de usuário personalizados

- **Gerenciamento de Produtos**
  - Cadastro de produtos agrícolas para doação
  - Upload e busca automática de imagens de produtos
  - Filtros por categoria, validade e termos de busca
  - Sistema de paginação para visualização de produtos

- **Sistema de Reservas**
  - Solicitação de reserva de produtos
  - Comunicação entre doador e receptor
  - Confirmação de reservas

- **Geolocalização**
  - Mapa interativo para localização de fazendas e produtos
  - Seleção de localização para cadastro de fazendas
  - Cálculo de distância entre usuário e produtos

- **Notificações**
  - Alertas sobre novas reservas
  - Confirmações de operações

## 🛠️ Tecnologias Utilizadas

- **Frontend**
  - React.js
  - Tailwind CSS para estilização responsiva
  - Context API para gerenciamento de estado

- **Backend e Banco de Dados**
  - Firebase Authentication para autenticação
  - Firestore para armazenamento de dados
  - Firebase Storage para armazenamento de imagens
  - Cloud Functions para operações em segundo plano

- **APIs Externas**
  - Google Maps para geolocalização
  - Google Custom Search para busca de imagens de produtos

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

### Configuração do Ambiente

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/agrodoacao.git
   cd agrodoacao
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   REACT_APP_FIREBASE_API_KEY=sua_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=seu_projeto
   REACT_APP_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   REACT_APP_FIREBASE_APP_ID=seu_app_id
   REACT_APP_GOOGLE_MAPS_API_KEY=sua_api_key_google_maps
   REACT_APP_GOOGLE_API_KEY=sua_api_key_google_search
   REACT_APP_GOOGLE_CX=seu_id_custom_search_engine
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   # ou
   yarn start
   ```
   A aplicação estará disponível em `http://localhost:3000`

5. **Para construir a versão de produção**
   ```bash
   npm run build
   # ou
   yarn build
   ```

## 📱 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── contexts/         # Contextos React (AuthContext)
├── firebase/         # Serviços do Firebase
├── pages/            # Páginas da aplicação
│   ├── Auth/         # Páginas de autenticação
│   ├── Farm/         # Gestão de fazendas
│   ├── Home/         # Página inicial
│   ├── Products/     # Listagem e detalhes de produtos
│   └── Profile/      # Perfil do usuário
├── services/         # Serviços externos (Google Maps, busca de imagens)
└── styles/           # Estilos CSS globais
```

## 🔒 Segurança

O projeto utiliza variáveis de ambiente para armazenar chaves de API e configurações sensíveis. Certifique-se de nunca compartilhar ou fazer commit dessas informações em repositórios públicos.

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit de suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Envie para o branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes.

## 📧 Contato

Para mais informações, entre em contato através de [espaula@inf.ufsm.br](mailto:espaula@inf.ufsm.br).

---

Desenvolvido com ❤️ para combater o desperdício de alimentos e promover a solidariedade.
