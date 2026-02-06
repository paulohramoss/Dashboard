# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.0.132] - 2026-02-06

### Adicionado
- Sistema de atualização automática para PWA instalado
- Notificação elegante quando nova versão está disponível
- Changelog visível no toast de atualização
- Atualização silenciosa em segundo plano quando usuário está inativo
- Configuração de frequência de notificações de atualização
- Modal customizado para limpar conversa do assistente financeiro

### Melhorado
- Performance do filtro de transações na página de transações
- Correção de race condition no carregamento de dados do Firestore
- Traduções completas em português e inglês

### Corrigido
- Bug na exibição de transações após aplicar filtros
- Problema com lista virtualizada não renderizando corretamente
- Erros de lint em arquivos gerados pelo PWA

## [1.0.131] - 2026-02-05

### Corrigido
- Bug na exibição de transações filtradas
- Race condition no carregamento de dados do Firestore

## [1.0.130] - 2026-02-04

### Adicionado
- Assistente financeiro com IA
- Sistema de notificações
- Modo sombra para simulações

### Melhorado
- Interface responsiva do dashboard
- Performance geral do aplicativo
