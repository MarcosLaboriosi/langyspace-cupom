# langyspace-cupom

Mini app publico de redirecionamento de cupons da Langy.space, previsto para
`https://cupom.langy.space`.

Ele roda em `cupom.langy.space`, le o slug da URL, chama a callable
`resolveShortLinkRedirect`, registra um clique em `short_link_clicks` no backend e redireciona para
o destino retornado.

## Como cadastrar um link

Crie manualmente um documento no Firestore:

- Colecao: `short_links`
- Documento: o slug em lowercase, por exemplo `livia10`
- Campo `reportId`: identificador opaco usado apenas no painel publico, por exemplo
  `rpt_8Yp2Nq4Tz6Vb1Rc5`

### Cupom de influencer para WhatsApp

Documento: `livia10`

```json
{
  "reportId": "rpt_8Yp2Nq4Tz6Vb1Rc5",
  "slug": "livia10",
  "title": "Cupom Lívia 10",
  "type": "whatsapp",
  "destinationUrl": "https://wa.me/5534997711070?text=Oi%2C%20Langy.space!%20Vim%20pela%20influencer%20L%C3%ADvia%20e%20queria%20usar%20o%20cupom%20LIVIA10.",
  "couponCode": "LIVIA10",
  "influencerName": "Lívia",
  "campaignName": "Embaixadoras",
  "source": "influencer",
  "medium": "coupon",
  "active": true
}
```

O exemplo acima redireciona para o WhatsApp da Langy.space com uma mensagem que identifica a
influencer e o cupom. O `couponCode` continua no documento para métricas, validação comercial e
relatórios.

Para links do tipo `checkout`, o backend preserva UTMs e adiciona `couponCode` ao destino quando o
campo `couponCode` existe no documento.

### Link direto ao site

Documento: `aula-gratis`

```json
{
  "reportId": "rpt_4Rc9Zp2Qw7Lm6Tn1",
  "slug": "aula-gratis",
  "title": "Aula grátis",
  "type": "website",
  "destinationUrl": "https://langy.space/aula-gratis",
  "couponCode": null,
  "influencerName": null,
  "campaignName": "Aula Grátis",
  "source": "instagram",
  "medium": "bio",
  "active": true
}
```

### QR Code de panfleto

Documento: `panfleto`

```json
{
  "reportId": "rpt_9Mh3Vx6Ka1Pb8Ny4",
  "slug": "panfleto",
  "title": "Panfleto físico",
  "type": "whatsapp",
  "destinationUrl": "https://wa.me/5534997711070?text=Oi%21%20Vim%20pelo%20panfleto%20da%20Langy%20e%20quero%20saber%20mais%20sobre%20as%20aulas.",
  "couponCode": null,
  "influencerName": null,
  "campaignName": "Panfletos",
  "source": "offline",
  "medium": "qr_code",
  "active": true
}
```

## Campos aceitos

`type` deve ser um destes valores:

- `whatsapp`
- `website`
- `landing_page`
- `form`
- `checkout`
- `other`

O redirecionamento sempre usa `destinationUrl`. Esse campo precisa comecar com `https://`.

Links de WhatsApp nao recebem UTMs automaticamente. Links do tipo `website`, `landing_page`, `form`
e `checkout` preservam UTMs no destino quando elas existem e ainda nao estao no `destinationUrl`.
Links do tipo `checkout` tambem adicionam o `couponCode` ao destino quando o documento tiver cupom.

## Metricas

Cada clique valido cria um documento em `short_link_clicks`.

O app salva slug, campanha, cupom, influencer, tipo, destino, UTMs, user agent, referrer sem query
string e uma versao sanitizada da URL acessada. Ele nao salva IP cru, telefone, nome ou e-mail do
lead.

O painel publico de acompanhamento fica em:

```text
https://cupom.langy.space/relatorio/<reportId>
```

Exemplo:

```text
https://cupom.langy.space/relatorio/rpt_8Yp2Nq4Tz6Vb1Rc5
```

Exemplo demonstrativo com dados mockados da Duda:

```text
https://cupom.langy.space/relatorio/rpt_DudaDemo9Xc4Pn7
```

Essa rota chama a callable `getShortLinkMetrics` no backend do `langyspace-teacher` com o
`reportId`, nao com o slug publico do cupom. O painel mostra apenas dados agregados e sanitizados:
funil da campanha, cliques, cadastros iniciados, contas criadas, checkouts, pagamentos,
matriculas realizadas, taxas de conversao, serie diaria, UTMs, conteudos divulgados, horarios,
dispositivos e regioes agregadas. Ela nao le Firestore direto no cliente e nao mostra nome,
telefone, e-mail, IP, user agent bruto nem URL completa.

Regioes, cidades e conteudos so devem aparecer no painel publico quando atingirem o volume minimo
definido pelo backend; abaixo disso, o painel agrupa em "Outras regioes", "Outras cidades" ou
"Outros conteudos". Os links prontos do painel adicionam UTMs por formato (`bio`, `story`, `reels`,
`post`, `whatsapp`) para melhorar a leitura da campanha sem exigir que a influencer monte URLs
manualmente.

Para atribuicao completa, `resolveShortLinkRedirect` adiciona `shortLinkClickId` e `shortLinkSlug`
em destinos first-party como `student.langy.space`. O app de aluno preserva esses parametros ate o
checkout e registra o evento `payment_viewed` antes de abrir o Asaas. Dados antigos sem
`shortLinkClickId` podem aparecer como fallback agregado por `couponCode`.

Quando o link tiver `campaignId` e `influencerId`, o clique tambem salva esses identificadores para
ranking e relatorios futuros sem depender apenas do nome publico da influencer.

Links inexistentes redirecionam para `https://langy.space` sem criar clique. Links inativos ou com
destino invalido podem gerar clique com `status: "inactive"` ou `status: "invalid_destination"` e
tambem redirecionam para `https://langy.space`.

## Entidades de campanha

Para manter o cadastro em nivel de producao, use tres camadas:

- `marketing_campaigns/{campaignId}`: cadastro canônico da campanha, por exemplo
  `marketing_campaigns/embaixadoras-2026`
- `marketing_influencers/{influencerId}`: cadastro canônico da influencer, redes sociais, status de
  onboarding e cupom padrao
- `short_links/{slug}`: documento leve usado pelo redirect server-side

O app publico chama a callable de redirect. A leitura de `short_links/{slug}` e a escrita de
`short_link_clicks` acontecem no backend. As colecoes `marketing_campaigns` e
`marketing_influencers` ficam para painel, operacao, ranking e enriquecimento futuro.

### Seed inicial das influencers

O repo tem um seed operacional para criar/atualizar a campanha `Embaixadoras` e os links:

- `livia10`
- `leticia10`
- `clara10`
- `emy10`

Rode com uma conta local autenticada no Google Cloud que tenha acesso ao projeto Firebase:

```bash
pnpm run seed:influencers
```

O seed preserva `createdAt` quando o documento ja existe e atualiza `updatedAt` a cada execucao.

Campos principais em `marketing_influencers/{influencerId}`:

```json
{
  "id": "livia",
  "displayName": "Lívia",
  "fullName": "Livia Tessallya Araújo Aguiar",
  "internalLabel": "Livia Tessallya Araújo Aguiar",
  "onboardingStatus": "pending_student_link",
  "studentAccountStatus": "not_created",
  "studentId": null,
  "defaultCampaignId": "embaixadoras-2026",
  "defaultCampaignName": "Embaixadoras",
  "defaultCouponCode": "LIVIA10",
  "defaultShortLinkReportId": "rpt_8Yp2Nq4Tz6Vb1Rc5",
  "defaultShortLinkSlug": "livia10",
  "source": "influencer",
  "medium": "coupon",
  "socialProfiles": {
    "instagram": {
      "handle": "l.tessallya._",
      "status": "active",
      "url": "https://www.instagram.com/l.tessallya._/"
    },
    "tiktok": {
      "handle": "liviaa._arauujo",
      "status": "active",
      "url": "https://www.tiktok.com/@liviaa._arauujo"
    }
  }
}
```

Campos principais em `short_links/{slug}`:

```json
{
  "reportId": "rpt_8Yp2Nq4Tz6Vb1Rc5",
  "slug": "livia10",
  "title": "Cupom Lívia 10",
  "type": "whatsapp",
  "destinationUrl": "https://wa.me/5534997711070?text=Oi%2C%20Langy.space!%20Vim%20pela%20influencer%20L%C3%ADvia%20e%20queria%20usar%20o%20cupom%20LIVIA10.",
  "couponCode": "LIVIA10",
  "influencerId": "livia",
  "influencerName": "Lívia",
  "campaignId": "embaixadoras-2026",
  "campaignName": "Embaixadoras",
  "source": "influencer",
  "medium": "coupon",
  "discountLabel": "10% off todos os meses",
  "discountType": "percent",
  "discountValue": 10,
  "discountScope": "all_months",
  "active": true
}
```

## Desenvolvimento

Configure as variaveis publicas `VITE_FIREBASE_*` em `.env` usando `.env.example` como referencia.

```bash
pnpm install
pnpm dev
pnpm run build
```

## Firebase Hosting

Antes do primeiro deploy, crie o site e aplique o target:

```bash
firebase hosting:sites:create langyspace-cupom --project langyspace-564b5
firebase target:apply hosting cupom langyspace-cupom --project langyspace-564b5
```

Depois, publique apenas o redirecionador:

```bash
pnpm run deploy
```

Configure o DNS/dominio `cupom.langy.space` para o Hosting site `langyspace-cupom` pelo Firebase
Hosting.

## Firestore Rules

Este app usa o mesmo Firestore dos outros apps da Langy.space. As regras compartilhadas ficam em
`../langyspace-teacher/firestore.rules` e o redirect publico deve passar pela callable
`resolveShortLinkRedirect`.

- `get/list` de `short_links` restrito a professor/backoffice
- `create` publico bloqueado em `short_link_clicks`; a callable registra os cliques pelo backend
- `get/list` autenticado em `marketing_campaigns` e `marketing_influencers`
- nenhum `update/delete` publico nessas colecoes

Valide e publique as regras a partir de `../langyspace-teacher`:

```bash
pnpm run rules:check
pnpm run rules:deploy
```
