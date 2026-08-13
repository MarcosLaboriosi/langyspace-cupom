# Plano técnico

- Criar auditor Playwright com Vite local em `scripts/audit-layout.mjs`.
- Usar o relatório demo existente como fixture canônica.
- Executar modos normal e stress na matriz de larguras comum.
- Adicionar `test:layout`, `validate:ui` e encadear o deploy ao gate.
- Instalar Chromium e rodar o gate no CI antes de autenticar; subir `.local/layout-audit` em falha.
- Exigir em `AGENTS.md` a classificação direta/indireta/nenhuma para todo prompt, conferência de
  cobertura antes da implementação e veredito explícito depois do diff.

Não há impacto em APIs ou dados. Toda requisição fora do servidor local será abortada pelo browser.
