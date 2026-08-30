
# 📡 FBT Controle Remoto

**Aplicativo mobile de e-commerce especializado em controles remotos**  
Desenvolvido com React Native + Expo para a disciplina de Mobile da FIAP

[![React Native](https://img.shields.io/badge/React%20Native-0.86.2-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57.x-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?style=flat-square)](https://tanstack.com/query)



---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Telas da Aplicação](#-telas-da-aplicação)
- [Padrões e Decisões Técnicas](#-padrões-e-decisões-técnicas)
- [Integrante do Grupo](#-integrante-do-grupo)

---

## 📱 Sobre o Projeto

O **FBT Controle Remoto** é um aplicativo mobile de e-commerce voltado à venda de controles remotos. O app consome a API REST do **MockMerce** (`api.mockmerce.com.br`) e implementa um fluxo completo de compra, desde a navegação por produtos e categorias até o checkout com geração de pedido.


---

## ✨ Funcionalidades

### 🛍️ Catálogo de Produtos
- Listagem paginada de produtos (6 por página) com busca em tempo real
- Visualização de preço único ou faixa de preço (para produtos com variantes)
- **Adição rápida ao carrinho** direto da listagem (produtos simples)
- Redirecionamento para detalhe em produtos com variantes

### 🗂️ Categorias
- Navegação por categorias disponíveis na loja
- Seleção redireciona para a listagem de produtos filtrada pela categoria

### 🛒 Carrinho de Compras
- Listagem dos itens adicionados com subtotal por produto
- Controle de quantidade (+ / −) com **atualização otimista** (UI responde instantaneamente)
- Remoção de itens 
- Exibição do total do pedido
- Acesso protegido (exige login)

### 📦 Pedidos
- Listagem de todos os pedidos do cliente autenticado
- Status do pedido com cores indicativas (Pendente, Pago, Cancelado, etc.)
- Linha do tempo do pedido (histórico de status)
- Ações de pagamento (simular aprovação/recusa) e cancelamento

### ❤️ Favoritos
- Marcar/desmarcar produtos como favoritos diretamente nos cards
- Lista dedicada de produtos salvos
- Adição ao carrinho diretamente da tela de favoritos

### 👤 Autenticação
- Login com e-mail e senha
- Cadastro de nova conta
- Recuperação de senha 

### 👤 Perfil
- Exibição dos dados do cliente autenticado
- Ação de logout

---

## 🛠 Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React Native** | 0.86.2 | Framework mobile cross-platform |
| **Expo** | 57.x | Toolchain e gerenciamento da build |
| **TypeScript** | 6.0 | Tipagem estática |
| **TanStack Query** | 5.x | Cache de dados, refetch e mutações otimistas |
| **React Navigation** | 7.x | Navegação entre telas (Stack + Bottom Tabs) |
| **Axios** | 1.7.x | Cliente HTTP com interceptors |
| **Expo SecureStore** | 57.x | Armazenamento seguro no dispositivo (token JWT, favoritos) |
| **@expo/vector-icons** | 15.x | Ícones (Ionicons, MaterialCommunityIcons) |
| **react-native-safe-area-context** | 5.7.x | Suporte a notch e áreas seguras |

---

### Camadas

- **`screens/`** — Componentes de tela. Recebem dados via hooks, sem lógica de negócio direta.
- **`hooks/`** — Encapsulam chamadas com TanStack Query (`useQuery`, `useMutation`). São a ponte entre tela e serviço.
- **`services/`** — Funções puras que fazem as chamadas HTTP via Axios. Não conhecem React.
- **`context/`** — Contextos globais (FavoritesContext).
- **`session/`** — Contexto de sessão do usuário (token, customer, login/logout).
- **`lib/`** — Utilitários reutilizáveis: `queryClient`, `queryKeys`, `format`, `secureStorage`, etc.
- **`types/`** — Interfaces e tipos TypeScript que espelham a API.
- **`theme/`** — Paleta de cores centralizada.

### Gerenciamento de Estado

| Estado | Solução |
|---|---|
| Dados do servidor (produtos, pedidos, carrinho) | TanStack Query |
| Sessão do usuário | React Context (`SessionProvider`) |
| Favoritos | React Context (`FavoritesProvider`) + SecureStore |
| Estado local de UI | `useState` / `useRef` |

---

## 📁 Estrutura de Pastas

```
FBT_Controle/
├── src/
│   ├── components/          # Componentes reutilizáveis de UI
│   │   ├── ui.tsx           #   Button, Loading, ErrorState
│   │   ├── CartHeaderButton.tsx
│   │   └── FavoritesHeaderButton.tsx
│   │
│   ├── context/
│   │   └── favorites.tsx    # FavoritesProvider + useFavorites
│   │
│   ├── hooks/               # Custom hooks (TanStack Query)
│   │   ├── useProducts.ts
│   │   ├── useProduct.ts
│   │   ├── useCart.ts
│   │   ├── useCartMutations.ts
│   │   ├── useQuickAddToCart.ts
│   │   ├── useOrders.ts
│   │   ├── useOrder.ts
│   │   ├── useOrderTimeline.ts
│   │   ├── useOrderActions.ts
│   │   ├── useAuthMutations.ts
│   │   ├── useBrands.ts
│   │   └── useCategories.ts
│   │
│   ├── lib/                 # Utilitários e helpers
│   │   ├── queryClient.ts   #   Instância do QueryClient
│   │   ├── queryKeys.ts     #   Chaves de cache centralizadas
│   │   ├── format.ts        #   Formatação de moeda
│   │   ├── orderStatus.ts   #   Labels e cores de status
│   │   ├── secureStorage.ts #   Persistência segura (sessão)
│   │   └── favoritesStorage.ts # Persistência de favoritos
│   │
│   ├── screens/             # Telas do aplicativo
│   │   ├── ProductsScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── CategoriasScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   ├── OrderDetailScreen.tsx
│   │   ├── PerfilScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── CadastroScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── ResetPasswordScreen.tsx
│   │
│   ├── services/            # Camada HTTP (Axios)
│   │   ├── http.ts          #   Instância Axios + interceptors
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── brands.ts
│   │   └── categories.ts
│   │
│   ├── session/
│   │   └── session.tsx      # SessionProvider + useSession
│   │
│   ├── theme/
│   │   └── colors.ts        # Paleta de cores do app
│   │
│   ├── types/
│   │   └── api.ts           # Tipos e interfaces da API
│   │
│   ├── env.ts               # Leitura das variáveis de ambiente
│   └── navigation.ts        # Tipos das rotas (Stack + Tabs)
│
├── App.tsx                  # Raiz do app (providers + navegação)
├── index.js                 # Ponto de entrada do Expo
├── app.json                 # Configuração do Expo
├── babel.config.js          # Babel com alias @/ → src/
├── tsconfig.json            # Configuração do TypeScript
├── package.json
├── .env.example             # Template de variáveis de ambiente
└── .gitignore
```

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 
- **npm** 
- **Android Studio**  com emulador configurado

---

## 🚀 Como Executar

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/KelsonZh0/FBT_Controle.git
cd FBT_Controle
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do seu grupo:

```env
EXPO_PUBLIC_API_URL=https://api.mockmerce.com.br
EXPO_PUBLIC_API_KEY=sk_live_sua_chave_aqui
EXPO_PUBLIC_STUDENT_RM=RM000000
```

### 3. Inicie o servidor de desenvolvimento

```bash
npx expo start
```

### 4. Abra o app

| Plataforma | Como abrir |
|---|---|
| **Celular físico** | Escaneie o QR code com o app Expo Go |
| **Emulador Android** | Pressione `a` no terminal |
| **Simulador iOS** | Pressione `i` no terminal (somente macOS) |
| **Navegador web** | Pressione `w` no terminal |

---

## 🔑 Variáveis de Ambiente

Todas as variáveis usam o prefixo `EXPO_PUBLIC_` para que o Expo as disponibilize no bundle do app.

| Variável | Descrição | Padrão |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base da API | `https://api.mockmerce.com.br` |
| `EXPO_PUBLIC_API_KEY` | Chave de API do grupo (identifica e isola a loja) | — |
| `EXPO_PUBLIC_STUDENT_RM` | RM do aluno que está testando (rastreio) | — |

---

## 📲 Telas da Aplicação

### Navegação

O app usa **React Navigation** com dois níveis de navegação:

```
Stack Navigator (RootStack)
│
├── Tabs (Bottom Tab Navigator)
│   ├── 🏠 Home          → ProductsScreen
│   ├── 🗂️ Categorias    → CategoriasScreen
│   ├── 🧾 Pedidos       → OrdersScreen
│   └── 👤 Perfil        → PerfilScreen
│
├── ProductDetail        → ProductDetailScreen
├── Cart                 → CartScreen
├── Favorites            → FavoritesScreen
├── Checkout             → CheckoutScreen
├── OrderDetail          → OrderDetailScreen
├── Login                → LoginScreen
├── Cadastro             → CadastroScreen
├── ForgotPassword       → ForgotPasswordScreen
└── ResetPassword        → ResetPasswordScreen
```


---


## 👥 Integrantes da Equipe

| Nome | RM | Turma | GitHub | LinkedIn |
|---|---|---|---|---|
| Alexander Dennis Isidro Mamani | 565554 | 2TDSPG | [alex-isidro](https://github.com/alex-isidro) | [LinkedIn](https://www.linkedin.com/in/alexander-dennis-a3b48824b/) |
| Kelson Zhang | 563748 | 2TDSPG | [KelsonZh0](https://github.com/KelsonZh0) | [LinkedIn](https://www.linkedin.com/in/kelson-zhang-211456323/) |

---
