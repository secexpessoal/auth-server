# Planejamento de Melhorias - Backend Auth

Este documento rastreia a implementação das melhorias profissionais no servidor de autenticação.

## 🟢 Fase 1: Fundação e Documentação (Prioridade Alta)
- [x] **Configurar JPA Auditing**: Datas de atualização automática.
- [x] **Implementar UUIDv7**: IDs ordenados temporalmente com timestamp implícito.
- [x] **Implementar Soft Delete**: Adicionado campo `active`.
- [x] **Configurar Swagger/OpenAPI**: Documentação interativa dos endpoints em `/swagger-ui.html`.
- [x] **Endpoint de Perfil (`/me`)**: UseCase para retornar dados detalhados do usuário logado.

## 🟡 Fase 2: Segurança Avançada (Prioridade Média)
- [x] **Sistema de Refresh Token**: Implementar tokens de renovação persistidos no banco de dados.
- [x] **Gestão de Senhas**:
    - [x] Rota de troca de senha (logado).
    - [x] Fluxo de redefinição de senha (esqueci a senha - simulação).
- [x] **Rate Limiting**: Proteção contra ataques de força bruta usando Bucket4j.

## 🔵 Fase 3: Qualidade e Observabilidade (Refinamentos)
- [x] **Logging Estratégico**: Adicionado logs com SLF4J nos UseCases e Filtros.
- [x] **Melhoria no Exception Handler**: Adicionado logging de stacktrace para erros 500.
- [x] **Documentação Profissional**: Swagger UI rica em detalhes e Javadoc completo.
- [ ] **Infraestrutura de Testes**: Criar base para testes unitários dos UseCases.

---
*Status Atual: Fase 2 concluída. Iniciando Fase 3 (Qualidade).*
