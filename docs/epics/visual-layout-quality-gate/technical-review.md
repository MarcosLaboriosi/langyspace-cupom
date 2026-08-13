# Review técnica

Snapshots de pixels foram rejeitados por instabilidade entre plataformas. O relatório demo evita
mock paralelo e conserva os contratos reais de renderização. O auditor DOM cobre invariantes
objetivas; screenshots cobrem julgamento visual.

O workflow não protege atividades que ainda não chegaram a commit. Por isso a revisão por prompt é
obrigatória no `AGENTS.md`; alterações de métricas, textos e contratos com reflexo no relatório são
impacto indireto e devem ampliar a fixture/matriz no mesmo trabalho.
