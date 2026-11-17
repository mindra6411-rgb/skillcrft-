# Resumo Executivo — Skill Craft

**Iniciativa:** Skill Craft — agência estudantil de serviços digitais
**Áreas:** Tecnologia da Informação · Administração · Marketing
**Equipe:** 6 integrantes (TI: 2 · ADM: 3 · Marketing: 1)
**Slogan oficial:** "Aprenda, desenvolva e prepare-se para o mercado."
**Assinatura de marca:** "Conhecimento que conecta, tecnologia que transforma."

## O que é

A Skill Craft é uma agência formada por estudantes que presta serviços
digitais e administrativos para o público escolar e iniciante no mercado:
apresentações, sites simples, revisão de trabalhos, resumos técnicos e artes
e logotipos. A iniciativa une três competências — tecnologia, gestão e
comunicação — em um único fluxo de atendimento, do primeiro contato ao
pós-venda.

## O problema

Estudantes e pequenos projetos precisam de serviços digitais com preço
acessível, prazo curto e alguém que entenda o contexto escolar. Ao mesmo
tempo, estudantes com habilidades técnicas e administrativas não encontram
espaço para aplicar o que aprendem em situações reais. A Skill Craft fecha
esse ciclo: quem precisa contrata, quem aprende executa.

## A solução

Um serviço organizado em cinco etapas — escolha do serviço, envio das
informações, orçamento, desenvolvimento e entrega com pós-venda — apoiado por
um site institucional próprio com formulário validado, protocolo de
acompanhamento (`SC-ANO-XXXX`), login com conta Google, área do aluno com
histórico e status dos pedidos, ferramentas gratuitas de estudo e central de
ajuda.

## Serviços e preços de referência (oficiais, imutáveis)

| Serviço | Preço de referência |
|---|---|
| Apresentações | R$ 15 |
| Sites simples | R$ 30 |
| Revisão de trabalhos | R$ 10 |
| Resumos técnicos | R$ 10 |
| Artes e logotipos | R$ 15 |

Os valores são comunicados como **preço de referência**, confirmados na etapa
de orçamento conforme o escopo. Não há planos, pacotes ou descontos.

## Estrutura da equipe

- **TI (2 integrantes):** Ítalo e Emilyn — site, autenticação, banco de
  dados, ferramentas digitais e infraestrutura.
- **ADM (3 integrantes):** organização dos serviços, processos internos,
  acompanhamento dos pedidos e controle financeiro.
- **Marketing (1 integrante):** identidade visual, posicionamento,
  comunicação e apresentação dos serviços.

## Tecnologia

React + TypeScript + Vite + Tailwind CSS, animações com Framer Motion,
ícones Lucide, autenticação Google via Supabase Auth e dados em Supabase
(PostgreSQL) com Row Level Security — cada usuário acessa apenas os próprios
pedidos, e a permissão é validada no banco, não na interface.

## Identidade visual

Símbolo SC em hexágono isométrico. Paleta oficial: Deep Slate `#101B3D`,
Skill Blue `#3155D9`, Accent Blue `#6B8CFF`, Dark Charcoal `#20232C`,
Off-White `#F7F8FC`. Tipografia: Montserrat (títulos), Roboto (texto) e Lato
(apoios e legendas).

## Diferenciais

1. **Processo documentado** com protocolo e status visíveis para o cliente.
2. **Transparência de preço** antes do desenvolvimento começar.
3. **Três áreas integradas** — um só lugar resolve serviço técnico,
   organização e comunicação.
4. **Honestidade técnica** — o produto declara o próprio estado e nunca
   simula funcionamento inexistente.
5. **Ferramentas gratuitas** que devolvem valor ao público estudante.

## Situação atual e pendências

O site está desenvolvido, revisado, funcional e **publicado** em
<https://skill-craft-site.vercel.app> (Vercel, build de produção do branch
`main`), com roteamento, 404 próprio, formulário validado, área do aluno com
busca e filtros, ferramentas de estudo e central de ajuda. Ficam **pendentes de
configuração externa**: um projeto Supabase ativo com o provedor Google
habilitado, a aplicação das migrations versionadas e as variáveis
`VITE_SUPABASE_*` na Vercel — sem elas, login, banco e painel administrativo
aparecem no site publicado como pendência declarada. O passo a passo está em
`docs/CONFIGURACAO.md`.

**Não são declarados:** clientes atendidos, faturamento, resultados
comerciais ou depoimentos — nenhum dado foi inventado para esta apresentação.
