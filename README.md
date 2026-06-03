# langyspace-cupom

Mini app publico de redirecionamento de cupons da Langy.space, previsto para
`https://cupom.langy.space`.

Ele roda em `cupom.langy.space`, le o slug da URL, busca `short_links/{slug}` no Firestore, registra
um clique em `short_link_clicks` e redireciona para `destinationUrl`.

## Como cadastrar um link

Crie manualmente um documento no Firestore:

- Colecao: `short_links`
- Documento: o slug em lowercase, por exemplo `livia10`

### Cupom de influencer para WhatsApp

Documento: `livia10`

```json
{
  "slug": "livia10",
  "title": "Cupom Lívia 10",
  "type": "whatsapp",
  "destinationUrl": "https://wa.me/5534997711070?text=Oi%21%20Vim%20pelo%20cupom%20LIVIA10%20e%20quero%20saber%20mais%20sobre%20as%20aulas%20da%20Langy.",
  "couponCode": "LIVIA10",
  "influencerName": "Lívia",
  "campaignName": "Embaixadoras",
  "source": "influencer",
  "medium": "coupon",
  "active": true
}
```

### Link direto ao site

Documento: `aula-gratis`

```json
{
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

## Metricas

Cada clique valido cria um documento em `short_link_clicks`.

O app salva slug, campanha, cupom, influencer, tipo, destino, UTMs, user agent, referrer sem query
string e uma versao sanitizada da URL acessada. Ele nao salva IP cru, telefone, nome ou e-mail do
lead.

Links inexistentes redirecionam para `https://langy.space` sem criar clique. Links inativos ou com
destino invalido podem gerar clique com `status: "inactive"` ou `status: "invalid_destination"` e
tambem redirecionam para `https://langy.space`.

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
`../langyspace-teacher/firestore.rules` e precisam permitir:

- `get` publico em `short_links/{slug}`
- `create` publico validado em `short_link_clicks/{clickId}`
- nenhum `update/delete` publico nessas colecoes

Valide e publique as regras a partir de `../langyspace-teacher`:

```bash
pnpm run rules:check
pnpm run rules:deploy
```
