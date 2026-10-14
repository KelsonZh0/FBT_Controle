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
- [Notificações: qual caminho escolhemos (e como testar)](#-notificações-qual-caminho-escolhemos-e-por-quê)
- [Defesa do movimento](#-defesa-do-movimento)
- [O que não funciona](#-o-que-não-funciona-e-por-quê)
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
- **Projeto:** Checkpoint 5 (CP5) — "A loja que responde": avaliações, retirada, notificações e movimento
- **Entrega:** 14/10, 10h09
- **Repositório:** [github.com/KelsonZh0/FBT_Controle](https://github.com/KelsonZh0/FBT_Controle)
- **Vídeo da entrega:** [Vídeo da entrega](https://youtube.com/shorts/RarHGuuDwKU?is=yRq7VvUK5DBeiRLl)

> O vídeo demonstra, em aparelho físico: avaliação de um produto comprado (com foto), pontos de
> retirada ordenados por distância, pedido com retirada, notificação abrindo a tela do produto, e
> o comportamento do app quando cada permissão é negada.

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
- Controle dos avisos da loja, com o estado da permissão explicado

### ⭐ Avaliações (RF-35 a RF-42)

- Média e contagem na tela do produto, vindas do próprio produto — sem requisição extra
- Lista de avaliações com os quatro estados de tela (carregando, erro, vazio, conteúdo)
- Consulta ao `can-review` **antes** de oferecer o formulário, com texto próprio por motivo
- Formulário com nota de 1 a 5 e comentário, validados antes do envio
- Anexo de foto da galeria via `POST /uploads`
- Com a galeria negada, o formulário continua utilizável e a tela explica o que se perdeu
- Lista e média se atualizam sozinhas depois do envio

### 📍 Retirada (RF-43 a RF-48)

- Permissão de localização com os três desfechos tratados: concedida, negada, e concedida sem posição
- Com posição, pontos ordenados por distância, com a distância na tela
- Sem posição, a lista continua aparecendo, sem ordenação, explicando o porquê e com caminho para tentar de novo
- Mapa com os pontos e a loja
- Escolha do ponto no checkout, refletida no pedido criado

### 🎬 Movimento (RF-49 a RF-55)

- Mola no toque dos controles, salto ao favoritar, entrada escalonada da lista, saída animada com acomodação dos vizinhos, carregamento com sinal de vida
- Respeito ao "Reduzir movimento" do sistema, substituindo o movimento sem remover o feedback
- Constante única que desliga todas as animações

### 🔔 Notificações (RF-56 a RF-60)

- Permissão pedida no momento do toque, não na abertura do app
- Histórico de avisos da loja consumido ao abrir e ao voltar do segundo plano
- Toque na notificação abre a tela do produto, inclusive com o app fechado
- Permissão negada não quebra nada: o perfil explica o estado e como reativar

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
| **react-native-reanimated**        | 4.5.1   | Movimento (RF-49 a RF-55)                                  |
| **react-native-worklets**          | 0.10.1  | Runtime de worklets exigido pelo Reanimated 4              |
| **expo-image-picker**              | 57.0.x  | Foto da galeria para as avaliações                        |
| **expo-location**                  | 57.0.x  | Posição para ordenar os pontos de retirada                |
| **react-native-webview**           | 13.16.1 | Mapa dos pontos de retirada (Leaflet + OpenStreetMap)      |
| **expo-notifications**             | 57.0.x  | Notificação local (Caminho B)                             |

> Todos instalados com `npx expo install`, nunca `npm install` solto — as versões acima são as que
> o SDK 57 resolve. **O `react-native-reanimated/plugin` NÃO está no `babel.config.js`**: desde o
> SDK 54 o `babel-preset-expo` já ativa o transform de worklets sozinho, e adicioná-lo à mão
> aplicaria o transform duas vezes.

---

## Arquitetura

### Camadas

- **`screens/`** — Componentes de tela. Recebem dados via hooks, sem lógica de negócio direta.
- **`hooks/`** — Encapsulam chamadas com TanStack Query (`useQuery`, `useMutation`). São a ponte entre tela e serviço.
- **`services/`** — Funções puras que fazem as chamadas HTTP via Axios. Não conhecem React.
- **`context/`** — Contextos globais (`FavoritesContext`).
- **`session/`** — Contexto de sessão do usuário (token, customer, login/logout).
- **`lib/`** — Utilitários reutilizáveis: `queryClient`, `queryKeys`, `format`, `secureStorage`, etc.
- **`notifications/`** — Módulo de notificações: permissão, canal do Android, apresentação local, deep link.
- **`types/`** — Interfaces e tipos TypeScript que espelham a API.
- **`theme/`** — Paleta de cores e **tabela de movimento** (durações, molas, constante de desligamento).

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
│   │   ├── motion.tsx       #   AnimatedListItem, FavoriteHeart, PulsingDots
│   │   ├── Stars.tsx        #   Estrelas de leitura e de entrada
│   │   ├── PickupMap.tsx    #   Mapa dos pontos de retirada
│   │   ├── CartHeaderButton.tsx
│   │   └── FavoritesHeaderButton.tsx
│   │
│   ├── notifications/       # Caminho B das notificações
│   │   ├── notifications.ts #   Permissão, canal, apresentação, deep link
│   │   └── NotificationsProvider.tsx
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
│   │   ├── useCategories.ts
│   │   ├── useReviews.ts        # (CP5) lista, can-review, envio
│   │   ├── usePickImage.ts      # (CP5) galeria com 3 desfechos
│   │   ├── useDeviceLocation.ts # (CP5) posição com 3 desfechos
│   │   ├── usePickupPoints.ts   # (CP5)
│   │   └── useStoreSettings.ts  # (CP5) origem do mapa
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
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── ProductReviewsScreen.tsx  # (CP5) avaliações
│   │   └── PickupPointsScreen.tsx    # (CP5) pontos de retirada
│   │
│   ├── services/            # Camada HTTP (Axios)
│   │   ├── http.ts          #   Instância Axios + interceptors
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── brands.ts
│   │   ├── categories.ts
│   │   ├── reviews.ts       #   (CP5) lista, can-review, criação
│   │   ├── uploads.ts       #   (CP5) multipart sem Content-Type fixo
│   │   ├── pickupPoints.ts  #   (CP5)
│   │   ├── push.ts          #   (CP5) histórico de avisos
│   │   └── store.ts         #   (CP5) configuração da loja
│   │
│   ├── session/
│   │   └── session.tsx      # SessionProvider + useSession
│   │
│   ├── theme/
│   │   ├── colors.ts        # Paleta de cores do app
│   │   └── motion.ts        # (CP5) durações, molas, ANIMATIONS_ENABLED
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

Conta de cliente já cadastrada na loja, para entrar direto sem precisar criar outra:

- **E-mail:** `kel12@gmail.com`
- **Senha:** `12345678`

Essa conta já tem **um pedido pago** do produto *Controle Compatível Trc Trc388*, que é o que
libera o formulário de avaliação (a API só deixa avaliar quem comprou **e pagou** — ver
[Avaliações](#-avaliações-rf-35-a-rf-42)). Ela também já deixou uma avaliação nesse produto, então
abrir as avaliações dele mostra o caso `ALREADY_REVIEWED`.

Para ver o formulário de avaliação em branco, use qualquer **outro** produto: adicione ao carrinho,
finalize e pague — aí ele passa a aceitar avaliação.

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
├── ProductReviews       → ProductReviewsScreen     (CP5)
├── Cart                 → CartScreen
├── Favorites            → FavoritesScreen
├── Checkout             → CheckoutScreen
├── PickupPoints         → PickupPointsScreen       (CP5)
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
- **Favoritos são armazenados localmente** (chaveados por `customer.id`), não via API. Correção de uma afirmação que esta seção trazia até o CP1: a API **tem** `GET/POST /customers/me/favorites` (por `variantId`). A escolha local foi nossa, e tem uma consequência que vale declarar: o gatilho do push real do Caminho A é a queda de preço de um produto **favoritado no servidor** — com favoritos só locais, esse gatilho nunca dispararia. Como fomos pelo Caminho B, isso não afeta a entrega, mas é dívida consciente.

### Decisões novas do CP5

- **A média da avaliação vem dentro do produto** (`GET /products/:id` → `rating: { average, count, distribution }`). Nenhuma tela calcula média a partir da lista: a lista é paginada, então a conta sairia errada, e ainda custaria uma requisição por produto.
- **`Content-Type` não é fixado no cliente axios.** O `POST /uploads` é `multipart/form-data` e o React Native precisa gerar o *boundary*; com o header fixo na instância, o upload falha sem mensagem clara. O axios já põe `application/json` sozinho quando o corpo é objeto, então remover não quebrou nada.
- **O id do upload chama-se `id`, não `mediaId`.** O enunciado diz "devolve `mediaId`", mas o campo na resposta é `id` — ler `mediaId` devolve `undefined` e a avaliação é criada sem foto, silenciosamente. Está documentado no tipo `UploadedMedia`.
- **`distanceKm` é opcional no tipo `PickupPoint`**, e `CanReviewReason` é uma união aberta (`| (string & {})`). Nos dois casos o TypeScript obriga a tratar o caso ruim — tela sem distância, motivo de recusa desconhecido — em vez de confiar que sempre vem.
- **A lista de pontos de retirada carrega antes da posição.** Buscamos sem coordenadas imediatamente e refazemos ordenado se a posição chegar. É isso que impede a tela de ficar presa em "Obtendo localização".
- **A posição usa primeiro `getLastKnownPositionAsync`**, com `getCurrentPositionAsync` depois para refinar, e timeout de 8s. Resultado instantâneo no caso comum, e sem travar quando o GPS não responde.
- **O mapa é Leaflet dentro de um WebView, não `react-native-maps`.** O `react-native-maps` depende da Google Maps SDK for Android, cuja chave só é lida em build nativo — no Expo Go a chave do app é ignorada e o mapa renderiza sem nenhum tile. Confirmamos em emulador e em aparelho físico. Leaflet com tiles do OpenStreetMap não exige chave, roda no Expo Go, e preserva o requisito de o projeto rodar com `npx expo start` numa máquina limpa — que um development build colocaria em risco.
- **Imports profundos no `expo-notifications`** (`expo-notifications/build/...`) em vez do índice do pacote — explicado em [O que não funciona](#-o-que-não-funciona-e-por-quê).

---

## 🎨 Decisões de Produto

- **Catálogo navegável sem login**: a listagem/detalhe de produtos fica aberta para visitantes, exigindo login apenas para carrinho, favoritos e pedidos — reflete o comportamento comum de lojas reais (navegar é livre, comprar exige conta).
- **Identidade visual "loja de eletrônicos/controles remotos"**: paleta azul-marinho (`#0B192C`) e amarelo (`#FFC700`), com a logo "FBT" nos cabeçalhos de Login/Cadastro/Recuperação de senha, ícone e splash do app.
- **Recuperação de senha em duas telas** (`ForgotPassword` → `ResetPassword`), em vez de uma única tela com fases, para deixar a navegação mais explícita.
- **Botões em formato de pílula** e cartões com sombra suave, fugindo do visual "cru" do app de referência do professor.

---

## 🔔 Notificações: qual caminho escolhemos, e por quê

**Caminho B — notificação local agendada pelo próprio app.**

A decisão não foi por preferência, foi por constatação. O `GET /push/status` da nossa loja responde:

```json
{ "enabled": false, "credencial": null, "servidorTemCredencial": false }
```

Sem credencial de FCM no servidor, todo envio real responderia `503 PUSH_DISABLED`. Subir uma
credencial do Firebase exigiria conta no Firebase, `google-services.json` fora do Git e um
*development build* — e o enunciado é explícito em que o Caminho B vale a mesma nota, existindo
justamente para que isso não decida a nota de ninguém.

**Como funciona na prática:** o app lê o histórico de envios da loja (`GET /push/messages`) ao
abrir e ao voltar do segundo plano, e apresenta como notificação local o que ainda não mostrou.
A data do aviso mais recente fica no SecureStore — sem isso, toda abertura repetiria o histórico
inteiro.

**O payload é tratado por inteiro:** `title` e `body` vão para a pessoa, e o `data` inteiro viaja
junto. No toque, lemos `data.produtoId` e abrimos a tela do produto — inclusive com o app fechado,
em que o toque não dispara listener nenhum e a resposta precisa ser lida de
`getLastNotificationResponseAsync()` na primeira montagem.

**Não pedimos o bônus do Caminho A.** O enunciado proíbe entregar o A pela metade e pedir o bônus,
e nós não entregamos o A de forma nenhuma.

### Como testar as notificações

1. **Perfil → "Ativar avisos"** e aceite a permissão. Repare que nada é pedido na abertura do app:
   a permissão só é solicitada neste toque.
2. **Os avisos aparecem logo em seguida.** Na primeira ativação o app ainda não mostrou nada, então
   ele apresenta o histórico de envios da loja inteiro. Se não aparecerem na hora, mande o app para
   segundo plano e volte — o consumo também roda ao retornar.
3. **Toque numa notificação:** o app abre a tela do produto que veio em `data.produtoId`.
4. **Com o app fechado:** feche o app pela lista de recentes e toque numa notificação da gaveta.
   Ele abre do zero e vai direto para o produto.

> **Importante:** o app guarda a data do aviso mais recente já apresentado, para não repetir o
> histórico a cada abertura. Então, depois da primeira vez, **só avisos novos aparecem**. Para
> gerar um aviso novo durante a correção:
>
> ```bash
> curl -X POST "https://api.mockmerce.com.br/v1/push/test" \
>   -H "X-API-Key: <a chave do grupo, a mesma do .env>" \
>   -H "X-Student-RM: 563748" \
>   -H "Content-Type: application/json" \
>   -d '{"produtoId":"cmtaa9z1a0mjor101arfzkty9","kind":"NOTIFICATION"}'
> ```
>
> A resposta vem com `skipped: 1` e `errorCode: NO_DEVICE` — **isso não é erro**. É o servidor
> dizendo que não havia aparelho FCM registrado, o que é esperado no Caminho B: nós lemos o
> histórico em vez de receber push. O aviso fica registrado e o app o apresenta.

### Como testar a degradação (permissão negada)

- **Galeria:** no formulário de avaliação, toque em "Anexar foto da galeria" e **negue**. O aviso
  explica o que se perdeu e o formulário continua enviável sem a foto.
- **Localização:** em Pontos de retirada, **negue** a permissão. A lista continua aparecendo, sem
  ordenação e sem distância, explicando o motivo, com botão para permitir.
- **Notificações:** Configurações do Android → Apps → Expo Go → Notificações → desative. O Perfil
  passa a explicar o estado e oferece "Abrir configurações"; o resto do app segue inteiro.
- **Reduzir movimento:** Configurações → Acessibilidade → Remover animações. Nada perde feedback —
  o movimento é substituído por estado estático, nunca removido.
- **Desligar todas as animações:** troque `ANIMATIONS_ENABLED` para `false` em
  [`src/theme/motion.ts`](src/theme/motion.ts). O app continua inteiramente usável.

---

## 🎬 Defesa do movimento

**O critério:** movimento só entra quando responde a uma ação da pessoa ou explica uma mudança de
estado. Movimento decorativo — que existe para o app "parecer moderno" — foi cortado. A régua
prática que usamos: *se a animação sumisse, alguém perderia informação?* Se a resposta é não, ela
não entrou.

**O que mantivemos, e o que cada uma informa:**

| Animação | Por que ficou |
| --- | --- |
| Mola no toque dos botões | Confirma que o toque foi registrado, antes de a ação terminar |
| Salto do coração ao favoritar | Favoritar não navega para lugar nenhum — sem o salto, nada diz que funcionou |
| Entrada escalonada da lista | Mostra que os itens chegaram agora, e dá ordem de leitura; com teto de 300 ms para o último item não esperar a cascata inteira |
| Saída + acomodação na lista de favoritos | Explica *para onde foi* o item removido, em vez de ele sumir e os vizinhos pularem |
| Pontos pulsando no carregamento | Diz que o app está vivo e esperando, em vez de um texto parado |

**O que cortamos:**

- **Transição customizada entre telas** — a do React Navigation já comunica hierarquia; trocá-la seria gosto, não informação.
- **Parallax na imagem do produto** — puro enfeite, e atrapalha a leitura do preço ao rolar.
- **Animação nos chips de marca e categoria** — o estado selecionado já é óbvio pela cor; mover também seria redundância.
- **Skeleton com brilho deslizante** — custa mais código que os pontos pulsando e informa a mesma coisa.

**Tudo sai de um arquivo só.** Durações, molas, escalonamento e a chave geral vivem em
[`src/theme/motion.ts`](src/theme/motion.ts); as peças prontas em
[`src/components/motion.tsx`](src/components/motion.tsx). Nenhuma tela chama `withSpring`
diretamente — elas compõem `AnimatedListItem` e `FavoriteHeart`.

**A constante de desligamento:** `ANIMATIONS_ENABLED` em `motion.ts`. Trocando para `false`, todo
o movimento do app some de uma vez e o app continua inteiramente usável. O mesmo vale quando o
sistema operacional pede "Reduzir movimento" — `useMotionEnabled()` combina as duas coisas.

**Reduzir movimento substitui, não remove.** É a parte que mais nos custou pensar. Em cada
componente existe um estado estático equivalente:

- botão → em vez de encolher, **esmaece** ao ser pressionado;
- coração → em vez de saltar, troca de contorno para preenchido e muda de cor;
- lista → aparece inteira, no lugar certo, sem cascata;
- carregamento → cai no indicador nativo da plataforma, que continua girando.

Em nenhum desses casos o feedback desaparece. Quem pediu menos movimento recebe menos movimento,
não menos informação.

---

## 🚧 O que não funciona (e por quê)

Preferimos declarar do que deixar o professor descobrir.

### 1. O canal do Android não é criado no Expo Go (RF-58)

A chamada `setNotificationChannelAsync` é rejeitada com:

```
java.lang.NullPointerException: null cannot be cast to non-null type
expo.modules.notifications.notifications.channels.NotificationsChannelsProvider
```

**Causa:** o Expo Go deixou de embarcar o módulo nativo de canais junto com a remoção do push
remoto no SDK 53. O código de criação do canal está correto e funcionaria num *development build*.

**Vale registrar a divergência:** o enunciado afirma que o Caminho B precisa de "nada além do Expo
Go", o que era verdade no SDK 54. No SDK 57 que o projeto usa, o canal não é mais criável lá.

**Como degradamos:** a falha é capturada, vira um `console.warn` e o app segue. Sem canal, o
Android entrega a notificação no canal padrão do app — o aviso continua chegando, o deep link
continua funcionando, e a ativação dos avisos não é interrompida. Também deixamos de apontar o
`channelId` quando o canal não existe, porque pedir um canal inexistente faria o Android **recusar
a notificação inteira**.

### 2. GPS do emulador (não é defeito do app)

No Android Emulator a posição fica congelada no Googleplex e nem `adb emu geo fix` nem o
*Set Location* dos Extended Controls a alteram — o botão fica desabilitado mesmo com o ponto
selecionado. **Em aparelho físico a ordenação por distância funciona normalmente** (Paulista 7,8 km
→ Tatuapé 12,8 → Santo Amaro 17,1 → Guarulhos 17,2). O RF-44 deve ser avaliado em aparelho real.

### 3. Sem testes automatizados

Continua valendo do CP1.

---

## 🤖 Uso de IA

Usamos o Claude (Cowork) como apoio durante o desenvolvimento, principalmente para:

Entender e resolver erros que apareciam ao tentar rodar o projeto (bugs conhecidos do próprio Expo, que travavam o app na hora de abrir).

Montar as telas de Login e Cadastro, e revisar como a parte de login/senha conversa com a API.

Corrigir alguns detalhes no final do projeto: um log de teste que tinha ficado esquecido no código, o nome e o ícone do app (que ainda estavam com o padrão do projeto de exemplo), uma mensagem de erro que faltava aparecer quando o produto estava sem estoque, e uma verificação a mais de segurança para confirmar se o login continua válido quando o app é reaberto.

Todo o código sugerido pela IA foi revisado e testado por nós antes de entrar no projeto — não copiamos nada sem entender o que estava fazendo.

### No Checkpoint 5 (declaração detalhada)

Usamos o **Claude Code (Opus)** de forma intensiva, em sessão de programação em par. Sendo direto
sobre a proporção: **a maior parte do código novo do CP5 foi escrita pela IA**, com as decisões de
produto e a verificação em aparelho feitas por nós. Declarar isso por baixo seria pior do que
declarar: o enunciado penaliza declaração incompatível com a arguição.

**Arquivos criados majoritariamente com IA:**

| Arquivo | O que é |
| --- | --- |
| `src/theme/motion.ts` | Durações, molas, constante de desligamento, `useMotionEnabled` |
| `src/components/motion.tsx` | `AnimatedListItem`, `FavoriteHeart`, `PulsingDots` |
| `src/components/Stars.tsx` | Estrelas de leitura e de entrada |
| `src/components/PickupMap.tsx` | Mapa de retirada |
| `src/screens/ProductReviewsScreen.tsx` | Tela de avaliações inteira |
| `src/screens/PickupPointsScreen.tsx` | Tela de pontos de retirada |
| `src/services/{reviews,uploads,pickupPoints,push,store}.ts` | Camada de serviços nova |
| `src/hooks/{useReviews,usePickImage,useDeviceLocation,usePickupPoints,useStoreSettings}.ts` | Hooks novos |
| `src/notifications/` | Módulo de notificações (Caminho B) |

**O que a IA fez além de escrever código:**

- Sondou a API real por `curl` antes de qualquer implementação, para descobrir os contratos de
  verdade (formato do `rating`, motivos do `can-review`, formato do `PickupPoint`, resposta do
  upload) em vez de programar contra suposição.
- Diagnosticou os três erros de ambiente registrados no Diário de Erro abaixo, incluindo a leitura
  do fonte do `expo-notifications` dentro do `node_modules` para achar o módulo que quebrava o app.

**O que fizemos nós:**

- Todas as decisões de produto: cidades e endereços dos pontos de retirada, textos das telas,
  identidade visual mantida do CP1, escolha do Caminho B.
- Toda a verificação em aparelho e emulador — nenhum requisito foi dado como pronto sem alguém
  abrir o app e usar.
- O cadastro no painel da loja e a conferência dos dados.

**Sobre a arguição:** os arquivos com decisão menos óbvia, e que portanto estudamos com mais
atenção, são `src/theme/motion.ts` (a combinação da constante com o "Reduzir movimento"),
`src/notifications/notifications.ts` (os imports profundos e o porquê) e
`src/hooks/useDeviceLocation.ts` (os três desfechos e o timeout).

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

### Checkpoint 5

- **`[Worklets] Tried to synchronously call a Remote Function` logo após instalar o Reanimated** — o app quebrava ao abrir o Perfil. O código estava certo: baixamos o bundle do Metro e conferimos que o worklet do nosso botão tinha sido compilado corretamente (`__pluginVersion: "0.10.1"`, closure só com o `scale`). O problema era que havia **um Metro antigo rodando na porta 8081**, iniciado *antes* do Reanimated existir no projeto — e um segundo `npx expo start` estava parado na pergunta "Port 8081 is being used, use 8082?". Quando o Reanimated é instalado, o `babel-preset-expo` passa a ativar o transform de worklets; o Metro já de pé servia cache de antes dessa mudança, gerando um bundle misturado. Resolvido matando o Metro velho e subindo com `npx expo start -c`.
- **Importar `expo-notifications` quebrava o app inteiro no Expo Go** — erro `expo-notifications: Android Push notifications ... was removed from Expo Go with the release of SDK 53`, mesmo usando **apenas notificação local**. Investigando o fonte do pacote: o `index.js` reexporta `DevicePushTokenAutoRegistration.fx`, um módulo de efeito colateral que chama `addPushTokenListener` assim que é carregado; esse listener passa por `warnOfExpoGoPushUsage()`, que **lança exceção** no Android dentro do Expo Go (não apenas avisa). Resolvido importando os módulos locais diretamente (`expo-notifications/build/NotificationsHandler`, `.../scheduleNotificationAsync`, etc.) — o pacote não declara `exports` no `package.json`, então esses caminhos são válidos. Confirmamos no bundle que o módulo problemático não entra mais.
- **`setNotificationHandler` sem efeito** — a maior parte dos tutoriais ensina `shouldShowAlert`, que está **depreciado** nesta versão: compila e não mostra nada. O par correto agora é `shouldShowBanner` + `shouldShowList`.
- **Canal do Android rejeitado com `NullPointerException`** — descrito em [O que não funciona](#-o-que-não-funciona-e-por-quê). Transformado em degradação silenciosa em vez de erro na tela.
- **Lista de pontos presa em "Obtendo localização" no emulador** — `getCurrentPositionAsync` esperava um *fix* novo do GPS, que o emulador não produz. Resolvido pedindo primeiro `getLastKnownPositionAsync` e só depois refinando, com timeout de 8 s e queda para o estado "concedida sem posição". Melhorou também o aparelho real: a lista aparece ordenada na hora, sem esperar o GPS fixar.
- **Mapa em branco no Expo Go, em emulador e em aparelho físico** — o `MapView` do `react-native-maps` montava (legenda e marca d'água do Google apareciam), mas nenhum tile carregava. Causa: a Google Maps SDK for Android exige chave, e o campo `android.config.googleMaps.apiKey` do `app.json` só é lido em build nativo; no Expo Go vale a chave da própria Expo. Em vez de partir para `expo prebuild` + chave + development build (que exige conta de faturamento no Google Cloud e quebraria o "roda com `npx expo start` numa máquina limpa"), trocamos por Leaflet + OpenStreetMap dentro de um `WebView`. Sem chave, sem build nativo, e o mapa passou a funcionar nos dois ambientes.
- **`adb emu geo fix` responde `OK` e não altera nada** — a posição do emulador fica congelada no Googleplex desde o boot, e o *Set Location* dos Extended Controls fica desabilitado mesmo com o ponto selecionado. Não há correção pelo lado do app; o RF-44 foi verificado em aparelho físico.

---

## ⚠️ Limitações Conhecidas

- Recuperação de senha depende de um endpoint de teste (`/email-outbox`) exclusivo do ambiente sandbox da API da turma — não existiria dessa forma numa API de produção real.
- Favoritos são armazenados apenas localmente no dispositivo (não sincronizam entre aparelhos diferentes do mesmo cliente), apesar de a API ter endpoint para isso — ver [Padrões e Decisões Técnicas](#-padrões-e-decisões-técnicas).
- Não há suíte de testes automatizados.
- Limitações específicas do CP5 (mapa, canal do Android, GPS do emulador) estão detalhadas em [O que não funciona](#-o-que-não-funciona-e-por-quê).

---

## 🗺️ Mapa de Autoria

Quem mexeu em quê, pra facilitar a arguição individual:

| Integrante                               | Principais contribuições                                                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kelson Zhang**                   | Telas de Login e Cadastro (com react-query), navegação em abas, telas de Produtos/Carrinho/Checkout/Pedidos, e os ajustes finais de identidade e sessão (`app.json`, ícone/splash, validação `GET /auth/me`, exibição de erro de estoque) |
| **Alexander Dennis Isidro Mamani** | Recuperação/redefinição de senha, sessão segura (`expo-secure-store`), tela de Perfil, paginação de produtos, e a funcionalidade de Favoritos                                                                                                |

> A configuração inicial do projeto (estrutura base, primeira integração do TanStack Query) veio do template de partida fornecido na disciplina.

### Checkpoint 5

| Frente | Arquivos principais | Responsável |
| --- | --- | --- |
| Movimento | `theme/motion.ts`, `components/motion.tsx`, `components/ui.tsx` | Alexander |
| Avaliações | `screens/ProductReviewsScreen.tsx`, `services/reviews.ts`, `services/uploads.ts`, `hooks/useReviews.ts`, `hooks/usePickImage.ts` | Alexander |
| Retirada e localização | `screens/PickupPointsScreen.tsx`, `components/PickupMap.tsx`, `hooks/useDeviceLocation.ts`, `services/pickupPoints.ts` | Kelson |
| Notificações | `notifications/`, `services/push.ts` | Kelson |
| Cadastro no painel e dados da loja | pontos de retirada, localização da loja, produto e pedido de teste | Kelson |

O CP5 foi desenvolvido em sessão de programação em par com IA — a proporção e o que coube a cada
lado estão declarados em [Uso de IA](#-uso-de-ia).

---

## 👥 Integrantes da Equipe

| Nome                           | RM     | Turma  | GitHub                                       | LinkedIn                                                           |
| ------------------------------ | ------ | ------ | -------------------------------------------- | ------------------------------------------------------------------ |
| Alexander Dennis Isidro Mamani | 565554 | 2TDSPG | [alex-isidro](https://github.com/alex-isidro) | [LinkedIn](https://www.linkedin.com/in/alexander-dennis-a3b48824b/) |
| Kelson Zhang                   | 563748 | 2TDSPG | [KelsonZh0](https://github.com/KelsonZh0)     | [LinkedIn](https://www.linkedin.com/in/kelson-zhang-211456323/)     |
