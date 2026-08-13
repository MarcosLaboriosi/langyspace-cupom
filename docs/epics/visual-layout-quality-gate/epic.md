# Epic: gate de qualidade visual do cupom

## Problema

O relatório público pode compilar e ainda publicar KPIs, funil, links e listas cortados em telas
estreitas ou com campanhas de nomes longos.

## Objetivo

Bloquear regressões geométricas do relatório de campanha antes de qualquer deploy.

## Escopo

- Auditar o relatório demo sanitizado em conteúdo normal e adversarial.
- Cobrir a matriz responsiva comum da Langy.
- Integrar testes, build, auditoria, evidências e CI.

## Fora de escopo

- Consultar relatórios reais ou rastrear cliques.
- Alterar métricas, funil ou identidade visual.
- Auditar o redirecionamento externo do cupom.

## Jornada e sucesso

Toda alteração visual atualiza a matriz quando necessário e só é publicável após
`pnpm run validate:ui` sem violações e revisão das screenshots representativas.
