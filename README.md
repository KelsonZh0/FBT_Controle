# 📡 FBT Controle Remoto

**Aplicativo mobile de e-commerce especializado em controles remotos**
Desenvolvido com React Native + Expo para a disciplina de Mobile da FIAP

[![React Native](<https://img.shields.io/badge/React%20Native-0.86.2-61DAFB?style=flat-square&logo=react>)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57.x-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Query](<https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?style=flat-square>)](https://tanstack.com/query)

---

## 📋 Sumário

- [Identificação](#-identificação)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Credenciais de Teste](#-credenciais-de-teste)
- [Telas da Aplicação](#-telas-da-aplicação)
- [Padrões e Decisões Técnicas](#-padrões-e-decisões-técnicas)
- [Decisões de Produto](#-decisões-de-produto)
- [Uso de IA](#-uso-de-ia)
- [Diário de Erro](#-diário-de-erro)
- [Limitações Conhecidas](#-limitações-conhecidas)
- [Mapa de Autoria](#-mapa-de-autoria)
- [Integrantes da Equipe](#-integrantes-da-equipe)

---

## 🪪 Identificação

- **Disciplina:** Mobile — 2º semestre
- **Turma:** 2TDSPG
- **Instituição:** FIAP
- **Projeto:** Checkpoint 4 (CP4) — evolução do app fio-condutor construído ao longo do semestre
- **Entrega:** 31/08, 10h09
- **Repositório:** [github.com/KelsonZh0/FBT_Controle](https://github.com/KelsonZh0/FBT_Controle)

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
- Mensagem de erro exibida junto ao item quando a API recusa a alteração (ex.: estoque insuficiente)
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
- Armazenamento local por cliente (funciona offline)

### 👤 Autenticação

- Login com e-mail e senha, com sessão persistida com segurança no dispositivo
- Sessão validada com o servidor (`GET /auth/me`) toda vez que o app é reaberto
- Logout automático caso o token expire/seja invalidado (qualquer 401 do backend)
- Cadastro de nova conta
- Recuperação de senha

### 👤 Perfil

- Exibição dos dados do cliente autenticado
- Ação de logout

---

## 🛠 Tecnologias

| Tecnologia                               | Versão | Finalidade                                                 |
| ---------------------------------------- | ------- | ---------------------------------------------------------- |
| **React Native**                   | 0.86.2  | Framework mobile cross-platform                            |
| **Expo**                           | 57.x    | Toolchain e gerenciamento da build                         |
| **TypeScript**                     | 6.0     | Tipagem estática                                          |
| **TanStack Query**                 | 5.x     | Cache de dados, refetch e mutações otimistas             |
| **React Navigation**               | 7.x     | Navegação entre telas (Stack + Bottom Tabs)              |
| **Axios**                          | 1.7.x   | Cliente HTTP com interceptors                              |
| **Expo SecureStore**               | 57.x    | Armazenamento seguro no dispositivo (token JWT, favoritos) |
| **@expo/vector-icons**             | 15.x    | Ícones (Ionicons, MaterialCommunityIcons)                 |
| **react-native-safe-area-context** | 5.7.x   | Suporte a notch e áreas seguras                           |

---

## Arquitetura

### Camadas

- **`screens/`** — Componentes de tela. Recebem dados via hooks, sem lógica de negócio direta.
- **`hooks/`** — Encapsulam chamadas com TanStack Query (`useQuery`, `useMutation`). São a ponte entre tela e serviço.
- **`services/`** — Funções puras que fazem as chamadas HTTP via Axios. Não conhecem React.
- **`context/`** — Contextos globais (`FavoritesContext`).
- **`session/`** — Contexto de sessão do usuário (token, customer, login/logout).
- **`lib/`** — Utilitários reutilizáveis: `queryClient`, `queryKeys`, `format`, `secureStorage`, etc.
- **`types/`** — Interfaces e tipos TypeScript que espelham a API.
- **`theme/`** — Paleta de cores centralizada.

### Gerenciamento de Estado

| Estado                                          | Solução                                           |
| ----------------------------------------------- | --------------------------------------------------- |
| Dados do servidor (produtos, pedidos, carrinho) | TanStack Query                                      |
| Sessão do usuário                             | React Context (`SessionProvider`)                 |
| Favoritos                                       | React Context (`FavoritesProvider`) + SecureStore |
| Estado local de UI                              | `useState` / `useRef`                           |

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
├── assets/                  # Ícone, splash e favicon do app
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
- **Android Studio** com emulador configurado (ou o app **Expo Go** num celular físico)

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

| Plataforma                 | Como abrir                                 |
| -------------------------- | ------------------------------------------ |
| **Celular físico**  | Escaneie o QR code com o app Expo Go       |
| **Emulador Android** | Pressione`a` no terminal                 |
| **Simulador iOS**    | Pressione`i` no terminal (somente macOS) |
| **Navegador web**    | Pressione`w` no terminal                 |

---

## 🔑 Variáveis de Ambiente

Todas as variáveis usam o prefixo `EXPO_PUBLIC_` para que o Expo as disponibilize no bundle do app.

| Variável                  | Descrição                                                | Padrão                          |
| -------------------------- | ---------------------------------------------------------- | -------------------------------- |
| `EXPO_PUBLIC_API_URL`    | URL base da API                                            | `https://api.mockmerce.com.br` |
| `EXPO_PUBLIC_API_KEY`    | Chave de API do grupo (identifica e isola a loja na API)   | —                               |
| `EXPO_PUBLIC_STUDENT_RM` | RM do aluno que está testando (rastreio para avaliação) | —                               |

Sem a `EXPO_PUBLIC_API_KEY` preenchida nenhuma rota funciona — todas exigem o header `X-API-Key`, e o app avisa isso no console em modo dev.

---

## 🔐 Credenciais de Teste

> ⚠️ **[PREENCHER antes da entrega]** — crie uma conta pela própria tela de **Cadastro** do app e
> anote aqui o e-mail/senha usados, para o professor conseguir logar direto sem precisar se
> cadastrar. Exemplo de formato:
>
> - **E-mail:** `alex12@fbt.com`
> - **Senha:** `123456`

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
├── OrderDetail           → OrderDetailScreen
├── Login                → LoginScreen
├── Cadastro              → CadastroScreen
├── ForgotPassword        → ForgotPasswordScreen
└── ResetPassword         → ResetPasswordScreen
```

---

## 🧩 Padrões e Decisões Técnicas

- **Uma instância única do axios** (`src/services/http.ts`), com `baseURL` fixo em `/v1`, headers `X-API-Key`/`X-Student-RM` fixos, e um interceptor de request que injeta `Authorization: Bearer` quando há sessão ativa.
- **Todo erro de API é normalizado** para um tipo único (`ApiError`, com `code`/`message`/`status`), tratando separadamente timeout, falha de rede e erro estruturado vindo do backend — assim toda tela trata erro do mesmo jeito.
- **TanStack Query para todo estado de servidor** (produtos, carrinho, pedidos): nenhuma tela busca dado com `useEffect` manual.
- **Context API para estado de cliente**, separado do react-query: `SessionProvider` (autenticação) e `FavoritesProvider` (favoritos), já que esses dados não vêm só do servidor.
- **`expo-secure-store` para persistir a sessão** (token + dados do cliente), com fallback para `localStorage` na versão web (SecureStore não existe no navegador).
- **Sessão validada no boot com `GET /auth/me`**: ao abrir o app, o token salvo é conferido no servidor antes de reabrir a sessão — se expirou, a sessão local é descartada em vez de mostrar dado desatualizado.
- **Logout automático em qualquer 401**: o interceptor de resposta detecta 401 de rota autenticada e dispara logout, mesmo em telas que não previram isso explicitamente.
- **Atualização otimista no carrinho** (`useCartMutations`): a UI muda a quantidade antes da resposta do servidor chegar, e desfaz automaticamente (`rollback`) se a API recusar — por exemplo, por falta de estoque — exibindo a mensagem de erro junto ao item afetado.
- **Favoritos são armazenados localmente** (chaveados por `customer.id`), não via API — a API da turma não expõe endpoint de favoritos. Essa escolha também resolve o requisito de funcionar offline, já que não depende de rede.

---

## 🎨 Decisões de Produto

- **Catálogo navegável sem login**: a listagem/detalhe de produtos fica aberta para visitantes, exigindo login apenas para carrinho, favoritos e pedidos — reflete o comportamento comum de lojas reais (navegar é livre, comprar exige conta).
- **Identidade visual "loja de eletrônicos/controles remotos"**: paleta azul-marinho (`#0B192C`) e amarelo (`#FFC700`), com a logo "FBT" nos cabeçalhos de Login/Cadastro/Recuperação de senha, ícone e splash do app.
- **Recuperação de senha em duas telas** (`ForgotPassword` → `ResetPassword`), em vez de uma única tela com fases, para deixar a navegação mais explícita.
- **Botões em formato de pílula** e cartões com sombra suave, fugindo do visual "cru" do app de referência do professor.

---

## 🤖 Uso de IA

Usamos o Claude (Cowork) como apoio durante o desenvolvimento, principalmente para:

Entender e resolver erros que apareciam ao tentar rodar o projeto (bugs conhecidos do próprio Expo, que travavam o app na hora de abrir).

Montar as telas de Login e Cadastro, e revisar como a parte de login/senha conversa com a API.

Corrigir alguns detalhes no final do projeto: um log de teste que tinha ficado esquecido no código, o nome e o ícone do app (que ainda estavam com o padrão do projeto de exemplo), uma mensagem de erro que faltava aparecer quando o produto estava sem estoque, e uma verificação a mais de segurança para confirmar se o login continua válido quando o app é reaberto.

Todo o código sugerido pela IA foi revisado e testado por nós antes de entrar no projeto — não copiamos nada sem entender o que estava fazendo.

---

## 🐞 Diário de Erro

Problemas reais enfrentados durante o desenvolvimento e como foram resolvidos:

- **Metro travando com `Cannot read properties of undefined (reading 'transformFile')`** — bug conhecido do Expo SDK 56+ relacionado a source maps. Resolvido limpando cache (`npx expo start -c`) e reinstalação limpa das dependências.
- **`Cannot find module 'babel-preset-expo'`** — o pacote não estava hoisted para a raiz do `node_modules` por não estar declarado como dependência direta. Resolvido instalando explicitamente (`npx expo install babel-preset-expo`).
- **Conflito `yarn.lock` + `package-lock.json` coexistindo** — o Expo CLI tentava usar `yarn` (não instalado) por detectar o lockfile. Resolvido removendo o `yarn.lock` e padronizando em `npm`.
- **`git diff` mostrando quase todo arquivo como modificado** — causado por diferença de final de linha (CRLF do Windows vs. LF do repositório). Resolvido com `git config core.autocrlf true`.
- **Erro de estoque no carrinho sendo tratado silenciosamente** — a mutation de quantidade usa atualização otimista com rollback automático em caso de erro, mas a UI não exibia mensagem nenhuma, dando a impressão de botão travado. Corrigido lendo o estado de erro da mutation e exibindo a mensagem junto ao item.
- **Ícone do app "preso" no Expo Go após corrigir o `app.json`** — reiniciar o Metro só recarrega o bundle JS, não o manifesto/ícone que o Expo Go já tinha em cache. Resolvido fechando o Expo Go por completo e reabrindo o projeto do zero.
- **Ícone gerado a partir da logo saiu com um quadriculado feio** — a imagem original não tinha transparência real (o "xadrez" estava desenhado nos próprios pixels, como fundo opaco). Corrigido removendo programaticamente o fundo branco/cinza antes de compor o ícone/splash sobre a cor da marca.

---

## ⚠️ Limitações Conhecidas

- Recuperação de senha depende de um endpoint de teste (`/email-outbox`) exclusivo do ambiente sandbox da API da turma — não existiria dessa forma numa API de produção real.
- Favoritos são armazenados apenas localmente no dispositivo (não sincronizam entre aparelhos diferentes do mesmo cliente).
- Não há suíte de testes automatizados.

---

## 🗺️ Mapa de Autoria

Quem mexeu em quê, pra facilitar a arguição individual:

| Integrante                               | Principais contribuições                                                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kelson Zhang**                   | Telas de Login e Cadastro (com react-query), navegação em abas, telas de Produtos/Carrinho/Checkout/Pedidos, e os ajustes finais de identidade e sessão (`app.json`, ícone/splash, validação `GET /auth/me`, exibição de erro de estoque) |
| **Alexander Dennis Isidro Mamani** | Recuperação/redefinição de senha, sessão segura (`expo-secure-store`), tela de Perfil, paginação de produtos, e a funcionalidade de Favoritos                                                                                                |

> A configuração inicial do projeto (estrutura base, primeira integração do TanStack Query) veio do template de partida fornecido na disciplina.

---

## 👥 Integrantes da Equipe

| Nome                           | RM     | Turma  | GitHub                                       | LinkedIn                                                           |
| ------------------------------ | ------ | ------ | -------------------------------------------- | ------------------------------------------------------------------ |
| Alexander Dennis Isidro Mamani | 565554 | 2TDSPG | [alex-isidro](https://github.com/alex-isidro) | [LinkedIn](https://www.linkedin.com/in/alexander-dennis-a3b48824b/) |
| Kelson Zhang                   | 563748 | 2TDSPG | [KelsonZh0](https://github.com/KelsonZh0)     | [LinkedIn](https://www.linkedin.com/in/kelson-zhang-211456323/)     |
