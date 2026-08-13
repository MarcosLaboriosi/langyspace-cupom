# Requisitos

- R1. Auditar `/relatorio/rpt_ClaraDemo9Xc4Pn7` sem rede externa.
- R2. Cobrir 390, 768, 1280, 1281, 1440, 1536, 1551, 1552 e 2048 px.
- R3. Exercitar textos longos em título, cupom, links, KPIs, listas e funil.
- R4. Rejeitar overflow, clipping mascarado, controles fora do viewport e conteúdo fora do dono.
- R5. Gerar resumo JSON e screenshots; anexar evidências quando o CI falhar.
- R6. Executar testes, build e auditoria no gate local e no workflow antes do Firebase.
- R7. Classificar todo prompt como impacto visual direto, indireto ou nenhum antes de agir e repetir
  a classificação no diff final.
- R8. Tratar dados, contratos, status, mensagens, ordenação e densidade que alterem o relatório como
  impacto indireto e cobri-los na matriz no mesmo trabalho.
- R9. Encerrar toda tarefa com `passed` e evidência, `not applicable` e motivo concreto ou `blocked`
  e a superfície que falhou.

## Aceite

O gate retorna erro diante de uma violação injetada, passa no baseline aceito e impede deploy quando
qualquer etapa falha.
