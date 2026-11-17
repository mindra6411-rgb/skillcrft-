# Plano de Negócio — Skill Craft

Documento de estruturação da iniciativa. **Não contém faturamento real,
custos apurados nem projeções de mercado**: a Skill Craft ainda não tem
histórico comercial declarado. Todos os números deste documento além da tabela
oficial de preços são **simulações hipotéticas**, marcadas como tal, usadas
apenas para demonstrar raciocínio de gestão.

---

## 1. Sumário

A Skill Craft é uma agência estudantil de serviços digitais organizada em três
áreas — TI, ADM e Design — que atende o público escolar e iniciante com
serviços de baixo custo, prazo curto e processo documentado. O ativo central é
um site próprio que concentra apresentação dos serviços, solicitação com
protocolo, acompanhamento pelo cliente e ferramentas gratuitas de estudo.

## 2. Proposta de valor

> Serviço digital de qualidade profissional, com preço acessível, processo
> claro e alguém que entende o contexto de quem está estudando.

O cliente sabe **o que** está comprando, **quanto** custa de referência e
**em que etapa** o pedido está. A equipe ganha experiência profissional real.

## 3. Público-alvo

- **Primário:** estudantes que precisam de apresentações, resumos, revisões e
  artes para trabalhos escolares e acadêmicos.
- **Secundário:** estudantes e pequenos projetos que precisam de um site
  simples ou de identidade visual básica.
- **Perfil:** orçamento limitado, prazo curto, valoriza clareza e atendimento
  próximo.

## 4. Serviços e preços (tabela oficial — imutável)

| Serviço | Preço de referência | Área executora |
|---|---|---|
| Apresentações | R$ 15 | Design |
| Sites simples | R$ 30 | TI |
| Revisão de trabalhos | R$ 10 | ADM |
| Resumos técnicos | R$ 10 | Três áreas integradas |
| Artes e logotipos | R$ 15 | Design |

Regras comerciais oficiais: preço comunicado como **referência** e confirmado
na etapa de orçamento; sem descontos, promoções, pacotes ou planos; sem
cobrança automatizada (não há gateway de pagamento no escopo).

## 5. Modelo de operação

Fluxo de atendimento em cinco etapas, suportado pelo site:

1. **Escolha do serviço** — o cliente seleciona um dos cinco serviços.
2. **Envio das informações** — formulário validado com serviço, nome,
   descrição, prazo desejado e meio de contato de retorno.
3. **Orçamento** — a ADM confirma escopo e valor de referência.
4. **Desenvolvimento** — a área executora realiza, com status atualizado
   (aguardando análise → em análise → em andamento).
5. **Entrega e pós-venda** — conclusão registrada (status concluído) e coleta
   de feedback; cancelamentos são registrados como cancelado, com motivo.

Cada pedido recebe protocolo `SC-ANO-XXXX` e fica visível ao cliente na área
do aluno, com busca e filtro por status.

## 6. Estrutura organizacional

| Área | Responsabilidades |
|---|---|
| TI | Site, autenticação, banco de dados, ferramentas, infraestrutura |
| ADM | Serviços, processos, pedidos, atendimento, controle financeiro |
| Design | Identidade visual, artes, logotipos e materiais de divulgação |

A coordenação das etapas é da ADM; a execução técnica é da TI; a identidade
visual e os materiais de divulgação são do Design. Nomes e quantidade de
integrantes não são divulgados no site (decisão do responsável pelo projeto);
a composição real está registrada em `docs/originais/equipe_envolvidos.md`.

## 7. Estrutura de custos

**Custos reais apurados: nenhum declarado até o momento.** A operação usa
ferramentas gratuitas em suas camadas iniciais e o trabalho dos integrantes é
estudantil, sem folha de pagamento.

Categorias que existiriam em operação real:

| Categoria | Natureza | Observação |
|---|---|---|
| Hospedagem do site | Fixa, baixa | Plano gratuito cobre o volume inicial |
| Banco de dados / autenticação | Fixa, baixa | Camada gratuita do provedor |
| Domínio próprio | Fixa, anual | *Opcional — em planejamento* |
| Ferramentas de design/escritório | Variável, baixa | Uso de ferramentas gratuitas |
| Divulgação | Variável | Orgânica, sem verba paga no momento |

## 8. Simulações hipotéticas (exemplos didáticos, não são resultados)

> ⚠️ **SIMULAÇÃO** — os números abaixo são exemplos ilustrativos de como a
> ADM organizaria o raciocínio financeiro. Não representam pedidos reais,
> clientes reais ou faturamento da Skill Craft.

**Simulação A — mês com 4 apresentações e 2 resumos:**
4 × R$ 15 + 2 × R$ 10 = R$ 60 + R$ 20 = **R$ 80** de entradas hipotéticas.

**Simulação B — mês com 1 site simples, 3 artes e 2 revisões:**
1 × R$ 30 + 3 × R$ 15 + 2 × R$ 10 = R$ 30 + R$ 45 + R$ 20 = **R$ 95** de
entradas hipotéticas.

**Simulação C — efeito de custos sobre a simulação A:**
se houvesse R$ 20 de despesas no mês (ferramentas e divulgação), o resultado
hipotético seria R$ 80 − R$ 20 = **R$ 60**.

Esses exemplos servem para mostrar que a operação é de **margem alta e custo
fixo baixo** — característica típica de serviço digital estudantil — e que o
crescimento depende de volume de pedidos, não de investimento.

## 9. Estratégia de crescimento

1. **Base:** indicação entre turmas e portfólio dos serviços entregues.
2. **Presença:** divulgação nos canais da escola com materiais visuais
   produzidos pelo Design *(publicação de perfis em redes sociais: em
   planejamento)*.
3. **Retenção:** ferramentas gratuitas de estudo e central de ajuda mantêm o
   público voltando ao site mesmo sem pedir serviço.
4. **Evolução de oferta:** novas ideias de serviço só entram após avaliação
   das três áreas e registro separado — a tabela oficial não é expandida sem
   decisão formal.

## 10. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Disponibilidade dos integrantes (rotina escolar) | Processo documentado e pedidos com prazo confirmado antes de aceitar |
| Dependência de serviços externos (hospedagem/banco) | Configuração documentada, migrations versionadas e degradação honesta no site |
| Pedidos mal especificados | Formulário validado com descrição, prazo e contato obrigatórios |
| Expectativa de entrega imediata | Central de ajuda explica as etapas sem prometer prazos que não existem |
| Perda de dados | Backups do projeto e do repositório; nada de informação sensível no frontend |

## 11. Indicadores que a ADM acompanharia

*(Definidos, ainda sem valores reais coletados.)*

- Pedidos recebidos por período e por serviço.
- Tempo entre solicitação e orçamento.
- Taxa de pedidos concluídos × cancelados.
- Retorno dos clientes no pós-venda.
- Uso das ferramentas gratuitas de estudo.

## 12. Próximos passos

1. ✅ **Concluído:** site publicado na Vercel —
   <https://skill-craft-site.vercel.app> (build de produção do branch `main`).
2. Ativar um projeto Supabase, habilitar o provedor Google e aplicar as
   migrations versionadas (`supabase/migrations/`), definindo as variáveis
   `VITE_SUPABASE_*` na Vercel e fazendo merge em `main` (o deploy de produção é
   automático — passo 4.3).
3. Iniciar o registro real de pedidos e indicadores.
4. Definir, em conjunto com as três áreas, os canais oficiais de divulgação.
5. Avaliar, em conjunto, as ideias futuras de serviço — sem alterar a tabela
   oficial.
