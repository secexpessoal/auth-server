# System Auth - Spring JWT

Serviço centralizado de gestão de identidade e autenticação para ecossistemas de aplicações. Este projeto provê um Painel Administrativo para controle de ciclo de vida de usuários e uma API robusta baseada em JWT para integração com serviços externos.

---

## 🚀 Acessos Rápidos

- **Painel Administrativo (Frontend)**: `/`
- **Documentação de API (Swagger)**: `/swagger-ui.html`
- **Saúde do Sistema (Actuator Health)**: `/actuator/health`
- **Métricas do Sistema (Actuator Metrics)**: `/actuator/metrics`

---

## 🏗️ Fluxo Geral do Ecossistema

Este diagrama ilustra a relação entre o Administrador, o Usuário Final, o Auth Server e as Aplicações de Terceiros.

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Administrador
    participant User as Usuário Final
    participant Auth as Auth Server (Este App)
    participant Ext as App Externa (Seu Backend)

    Note over Admin, Auth: Gestão Administrativa
    Admin->>Auth: Cria/Ativa Usuários e Reseta Senhas

    Note over User, Auth: Autenticação
    User->>Auth: Realiza Login e obtém JWT

    Note over User, Ext: Consumo de Serviços
    User->>Ext: Requisição com Token JWT
    Ext->>Auth: Valida Token via /v1/user/profile
    Auth-->>Ext: Retorna Claims (Roles, ID, Email)
    Ext-->>User: Entrega Recurso Protegido
```

---

## 🔐 Módulo 1: Autenticação e Gestão de Sessão (Público)

### Ciclo de Vida e Rotação de Tokens (Silent Refresh)
O sistema utiliza uma política rigorosa de **Refresh Token Rotation**. Toda vez que o Access Token expira e o cliente solicita uma renovação (`/v1/user/refresh`), o servidor invalida o Refresh Token anterior e gera um novo par.
- **Silent Refresh**: O processo ocorre em background via cookies `HttpOnly`, mantendo a sessão ativa sem deslogar o usuário.
- **Segurança**: Se um token antigo for reutilizado, o sistema detecta a quebra de sequência e invalida a sessão.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente (Web/Mobile)
    participant API as Auth API
    participant DB as Banco de Dados

    Note over Client, DB: Processo de Login
    Client->>API: POST /v1/user/login (Email/Senha)
    API->>DB: Valida credenciais e status (Ativo?)
    DB-->>API: Usuário OK
    API-->>Client: 200 OK (JSON: AccessToken | Set-Cookie: RefreshToken V1)

    Note over Client, DB: Ciclo de Refresh (Silencioso e Rotativo)
    Client->>API: POST /v1/user/refresh (Lê Cookie V1)
    API->>DB: Valida e Invalida Token V1
    DB-->>API: Token Válido
    API-->>Client: 200 OK (JSON: Novo AccessToken | Set-Cookie: Novo RefreshToken V2)

    Note over Client, DB: Logout
    Client->>API: POST /v1/user/logout
    API-->>Client: 302 Found (Limpa Cookies e Invalida no DB)
```

---

## 👥 Módulo 2: Gestão de Contas e Ciclo de Vida (ADMIN)

Fluxo completo de criação e controle de privilégios executado exclusivamente por administradores.

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Administrador
    participant API as Auth API
    participant DB as Banco de Dados

    Note over Admin, DB: Registro de Novos Membros
    Admin->>API: POST /v1/user/register (Payload: User/Manager)
    API->>DB: Persiste com Status PENDENTE
    API-->>Admin: Usuário Criado (Pendente)

    Note over Admin, DB: Gestão de Status
    Admin->>Auth API: GET /v1/user?email={...}&userName={...}&position={...}
    Admin->>Auth API: PATCH /v1/user/activate?id={uuid}
    API->>DB: Altera Status para ATIVO
    Admin->>Auth API: PATCH /v1/user/deactivate?id={uuid}
    API->>DB: Altera Status para INATIVO

    Note over Admin, DB: Gestão de Perfis e Cargos
    Admin->>Auth API: PATCH /v1/user/profile/{id} (Atualiza Metadados)
    Admin->>Auth API: PATCH /v1/user/{id}/roles (Atualiza Roles: USER, MANAGER, ADMIN)

    Note over Admin, DB: Registro de Administradores
    Admin->>API: POST /v1/user/register/admin
    API->>DB: Persiste novo ADMIN
```

### Detalhes de Endpoints ADMIN:
- **Listagem Paginada (`GET /v1/user`)**: Suporta filtros por `email`, `userName` e `position` (Cargo).
- **Gestão de Roles (`PATCH /v1/user/{id}/roles`)**: Permite alteração granular dos privilégios.
- **Registro de Administradores (`POST /v1/user/register/admin`)**: Criação de contas com privilégios totais.

---

## 🔑 Módulo 3: Segurança e Políticas de Senha

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuário
    participant Admin as Administrador
    participant API as Auth API
    participant DB as Banco de Dados

    Note over User, DB: Troca Voluntária (Logado)
    User->>API: POST /v1/password/change (Senha Antiga/Nova)
    API->>DB: Valida atual e persiste nova
    API-->>User: Confirmação de Alteração

    Note over User, DB: Primeiro Acesso (Pós-Registro ou Reset)
    User->>API: POST /v1/password/first-change (Nova Senha Definitiva)
    API->>DB: Remove flag de troca obrigatória
    API-->>User: Acesso Integral Configurado

    Note over Admin, DB: Reset Emergencial
    Admin->>API: POST /v1/password/admin-reset (ID)
    API->>DB: Gera hash temporário e marca como "Troca Obrigatória"
    API-->>Admin: Retorna Senha Temporária em Texto Puro
```

---

## 👤 Módulo 4: Perfil e Dados Cadastrais (Autenticado)

Acesso a metadados do usuário logado e edição de informações de perfil.

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuário Logado
    participant API as Auth API
    participant DB as Banco de Dados

    User->>API: GET /v1/user/profile (Header: Authorization)
    API->>DB: Busca detalhes do portador do token
    DB-->>API: Dados (Roles, Email, Metadados)
    API-->>User: Retorna Objeto Perfil

    Note over User, API: Edição de Perfil
    User->>API: PATCH /v1/user/profile/{id} (Novos dados)
    API->>DB: Atualiza campos permitidos (Nome, Cargo, etc)
    API-->>User: Retorna Perfil Atualizado
```

---

## 🖥️ Módulo 5: Painel Administrativo (Frontend)

O frontend foi desenvolvido como um SPA (Single Page Application) moderno.

### Tecnologias:
- **Vite + React + TypeScript**
- **Storybook**: Documentação dinâmica em `npm run storybook`.
- **Vitest**: Suíte de testes unitários.

### Comandos Úteis (Diretório `/frontend`):
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera o pacote de produção.
- `npm run storybook`: Abre a documentação visual.
- `npm run test`: Executa os testes unitários.

---

## 🚀 Arquitetura Híbrida: API vs Forward Auth (SSO)

O Auth Server suporta dois modos principais de operação para atender diferentes necessidades de integração.

### 1. Modo API REST (Integração Direta)
- O cliente chama `POST /v1/user/login`.
- O servidor retorna o `accessToken` (JWT) no JSON.
- O cliente envia o header `Authorization: Bearer <jwt>` nas chamadas.

### 2. Modo Forward Auth (Traefik / SSO Web)
Ideal para proteger múltiplos subdomínios sem alterar o código das aplicações de destino.

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuário (Browser)
    participant Proxy as Traefik / Proxy
    participant Auth as Auth Server
    participant App as App Interna (Ex: RH)

    User->>Proxy: Acessa rh.dominio.com
    Proxy->>Auth: GET /v1/auth/verify (Verifica Cookies/JWT)
    
    alt Não Autenticado
        Auth-->>Proxy: 401 Unauthorized
        Proxy-->>User: Redireciona para /login
    else Autenticado
        Auth-->>Proxy: 200 OK + Header(Authorization: Bearer JWT)
        Proxy->>App: Repassa Requisição + JWT injetado
        App-->>User: Renderiza Página
    end
```

### Exemplo de Configuração Traefik:
```yaml
services:
  traefik:
    image: traefik:v3.0
    ports: ["80:80"]
    volumes: ["/var/run/docker.sock:/var/run/docker.sock:ro"]

  auth-server:
    build: .
    labels:
      - "traefik.http.middlewares.auth-forward.forwardauth.address=http://auth-server:8080/v1/auth/verify"
      - "traefik.http.middlewares.auth-forward.forwardauth.trustForwardHeader=true"
      - "traefik.http.middlewares.auth-forward.forwardauth.authResponseHeaders=Authorization"

  app1-rh:
    image: nginx:alpine
    labels:
      - "traefik.http.routers.app1.rule=Host(`rh.dominio.com`)"
      - "traefik.http.routers.app1.middlewares=auth-forward"
```

---

## 🔗 Guia de Integração para Desenvolvedores

### 🚩 A "Regra de Ouro": Valide tudo no seu backend
**Nunca valide apenas a assinatura do JWT localmente.** A melhor forma de validar se quem está mandando o request é o Auth Server e se o usuário continua ativo é usando a rota de profile.

**Padrão Recomendado:**
- **Endpoint**: `GET /v1/user/profile`
- **Por que?** Garante que o usuário não foi desativado no banco após a emissão do token e retorna as `roles` atualizadas.

---

## 🛡️ Mecanismo de Segurança e Tokens

1. **Dual Token**: Access (15 min) e Refresh (7 dias, HttpOnly).
2. **Versionamento e Rotação**: Cada renovação incrementa a versão da sessão, invalidando tokens antigos.
3. **Isolamento de Sessão (Fingerprinting)**: Sessões vinculadas a `User-Agent` e `IP Address`.
4. **Rastreabilidade**: Logs com `requestId` e `userEmail` via MDC.

---

## ⚠️ Sistema de Erros Unificado

1. **CustomErrorController**: Intercepta erros globais.
2. **Redirecionamento**: Requisições de browser para rotas inválidas vão para `/?error_code={status}`.
3. **ErrorPage**: Componente React em `frontend/src/app/errors/error.page.tsx` renderiza o erro visualmente.
4. **API**: Chamadas em `/v1/**` recebem JSON estruturado.

---
Desenvolvido por Vinícius Gabriel Pereira Leitão. Licença BSD 3-Clause.
