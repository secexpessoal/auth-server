# Planejamento de Melhorias - Backend Auth

Este documento rastreia a implementação das melhorias profissionais no servidor de autenticação.

## 🟢 Fase 1: Fundação e Documentação (Prioridade Alta)
- [x] **Configurar JPA Auditing**: Datas de atualização automática.
- [x] **Implementar UUIDv7**: IDs ordenados temporalmente com timestamp implícito.
- [x] **Implementar Soft Delete**: Adicionado campo `active`.
- [ ] **Configurar Swagger/OpenAPI**: Documentação interativa dos endpoints em `/swagger-ui.html`.
- [ ] **Endpoint de Perfil (`/me`)**: UseCase para retornar dados detalhados do usuário logado.

## 🟡 Fase 2: Segurança Avançada (Prioridade Média)
- [ ] **Sistema de Refresh Token**: Implementar tokens de renovação persistidos no banco de dados.
- [ ] **Gestão de Senhas**:
    - [ ] Rota de troca de senha (logado).
    - [ ] Fluxo de redefinição de senha (esqueci a senha - simulação).
- [ ] **Rate Limiting**: Proteção contra ataques de força bruta usando Bucket4j.

## 🔵 Fase 3: Refinamentos (Prioridade Baixa)
- [ ] **Logs de Auditoria**: Registrar tentativas de login falhas.
- [ ] **Melhoria no JWT**: Adicionar Claims extras (como o ID do usuário) no payload do token.

---
*Status Atual: Planejamento concluído. Pronto para iniciar a Fase 1.*
