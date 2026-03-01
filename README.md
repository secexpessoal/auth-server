# System Auth - Spring JWT

Serviço centralizado de gestão de identidade e autenticação para ecossistemas de aplicações. Este projeto provê um Painel Administrativo para controle de ciclo de vida de usuários e uma API robusta baseada em JWT para integração com serviços externos.

---

## 🚀 Acessos Rápidos

- **Painel Administrativo (Frontend)**: `/`
- **Documentação de API (Swagger)**: `/swagger-ui.html`

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
    Ext->>Auth: Valida Token e obtém Identidade
    Auth-->>Ext: Retorna Claims (Roles, ID, Email)
    Ext-->>User: Entrega Recurso Protegido
```

---

## 🔐 Módulo 1: Autenticação e Gestão de Sessão (Público)

Detalhamento técnico do processo de login, renovação via Refresh Token (Cookie HttpOnly) e encerramento de sessão.

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
    API-->>Client: 200 OK (JSON: AccessToken | Set-Cookie: RefreshToken)

    Note over Client, DB: Ciclo de Refresh (Silencioso)
    Client->>API: POST /v1/user/refresh (Lê Cookie HttpOnly)
    API->>DB: Valida persistência do Refresh Token
    DB-->>API: Token Válido
    API-->>Client: 200 OK (JSON: Novo AccessToken | Set-Cookie: Novo RefreshToken)

    Note over Client, DB: Logout
    Client->>API: POST /v1/user/logout
    API-->>Client: 204 No Content (Limpa Cookie de Refresh)
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
    Admin->>API: GET /v1/user (Consulta Paginada)
    Admin->>API: PATCH /v1/user/activate?id={uuid}
    API->>DB: Altera Status para ATIVO
    Admin->>API: PATCH /v1/user/deactivate?id={uuid}
    API->>DB: Altera Status para INATIVO

    Note over Admin, DB: Registro de Administradores
    Admin->>API: POST /v1/user/register/admin
    API->>DB: Persiste novo ADMIN
```

---

## 🔑 Módulo 3: Segurança e Políticas de Senha

Processos de segurança para troca voluntária, segurança de primeiro acesso e recuperação administrativa.

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
    API-->>Admin: Retorna Senha Temporária em Texto Puro (Para comunicar o usuário)
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

    User->>API: PATCH /v1/user/profile/{id} (Novos dados)
    API->>DB: Atualiza campos permitidos
    API-->>User: Retorna Perfil Atualizado
```

---

## 🔗 Guia de Integração para Outros Backends

Fluxo sugerido para aplicações externas que utilizam o Auth Server como Provedor de Identidade (IdP).

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuário Final
    participant MyApp as Sua API (Externo)
    participant Auth as Auth Server (Este Projeto)

    Note over User, MyApp: Início da Requisição
    User->>MyApp: Chama recurso protegido (Envia JWT no Header)

    Note over MyApp, Auth: Validação de Identidade (Auth Interceptor)
    MyApp->>Auth: GET /v1/user/profile (Repassa o Token JWT)

    alt Token é Válido
        Auth-->>MyApp: 200 OK (JSON: id, email, roles, metadata)
        Note left of MyApp: Aplica Lógica de Autorização Interna baseada nas Roles recebidas
        MyApp->>User: 200 OK (Retorna os dados da sua API)
    else Token Inválido/Expirado
        Auth-->>MyApp: 401 Unauthorized
        MyApp->>User: 401 Unauthorized (Exige novo login no Auth Server)
    end
```

### Regras de Ouro para APIs Externas:

1. **Não armazene senhas**: Deixe que o Painel Admin deste projeto cuide de toda a gestão de segurança.
2. **Valide em cada request**: Utilize o endpoint de perfil do Auth Server como uma barreira de segurança (Introspecção de Token).
3. **Roles Dinâmicas**: Use as roles retornadas pelo Auth Server para controlar o acesso granular às suas próprias rotas.

---

Desenvolvido por Vinícius Gabriel Pereira Leitão.
