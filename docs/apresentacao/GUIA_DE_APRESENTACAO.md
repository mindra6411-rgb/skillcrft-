# Guia de Apresentação — Skill Craft

Guia prático de **ordem, tempos, transições e ensaio**. Use junto com
[ROTEIRO_COMPLETO.md](./ROTEIRO_COMPLETO.md) e
[ROTEIRO_DEMONSTRACAO_SITE.md](./ROTEIRO_DEMONSTRACAO_SITE.md).

## Áreas da equipe

| Área | Quem fala |
|---|---|
| TI | Os blocos técnicos, divididos entre os integrantes da área |
| ADM | Os blocos de gestão, processos e financeiro |
| Design | Os blocos de identidade visual, artes e divulgação |

**Não cite nomes de integrantes nem quantidade de pessoas** — fale "a equipe
de ADM", "a equipe de TI" e "a equipe de Design". A composição real está
registrada em `../originais/equipe_envolvidos.md` e só deve ser mencionada se
a equipe decidir divulgá-la na apresentação.

## Ordem e tempos (formato 12 minutos)

| # | Parte | Quem | Tempo | Acumulado |
|---|---|---|---|---|
| 1 | Abertura e identidade | Design | 1:00 | 1:00 |
| 2 | O problema e a solução | Design | 1:00 | 2:00 |
| 3 | Serviços e preços de referência | ADM | 1:30 | 3:30 |
| 4 | Como funciona (5 etapas) | ADM | 1:00 | 4:30 |
| 5 | **Demonstração do site** | TI | 3:30 | 8:00 |
| 6 | Tecnologia e segurança | TI | 1:30 | 9:30 |
| 7 | Ferramentas do estudante | TI | 0:45 | 10:15 |
| 8 | Organização e controle | ADM | 0:45 | 11:00 |
| 9 | Encerramento | Design | 1:00 | 12:00 |

**Formato curto (7 min):** mantenha 1, 3, 5 (reduzida a 2:00), 6 e 9.
**Formato longo (20 min):** acrescente perguntas da banca ao final, usando
[PERGUNTAS_DA_BANCA.md](./PERGUNTAS_DA_BANCA.md).

## Transições (as "passagens de bastão")

Use frases curtas e nominais; elas evitam silêncio entre falantes:

- Design → ADM: *"Mas serviço só existe se houver organização. Com a
  palavra, a equipe de ADM."*
- ADM → TI: *"E é a TI que transforma esse processo em produto. A equipe de
  TI assume agora."*
- TI → Demonstração: *"Chega de explicar — vamos ver funcionando."*
- Demonstração → Tecnologia: *"Por trás dessas telas, algumas decisões
  técnicas importantes."*
- TI → ADM: *"Organização e dinheiro também são parte do projeto. ADM, por
  favor."*
- ADM → Design (encerramento): *"E para fechar, a identidade que faz a Skill
  Craft ser reconhecida."*
- Encerramento: *"Aprenda, desenvolva e prepare-se para o mercado. Obrigado."*

## Divisão de fala sugerida dentro da TI

Os integrantes de TI devem alternar blocos, nunca dividir uma frase no meio:

- **Integrante 1:** desenvolvimento do site, tecnologias, desafios técnicos.
- **Integrante 2:** autenticação, banco de dados e segurança, ferramentas
  digitais, melhorias futuras.

## Ensaio

### Regra dos três ensaios

1. **Ensaio individual (30 min por pessoa):** cada integrante lê o próprio
   bloco em voz alta, cronometrando. Ajuste o texto para caber no tempo.
2. **Ensaio em dupla por área (45 min):** TI ensaia junto, ADM ensaia junto,
   Design ensaia junto. Alinhe onde cada um entra e sai.
3. **Ensaio geral com transições (25 min, duas vezes):** apresentação
   completa, cronometrada, com a demonstração do site real. Marque os pontos
   em que alguém quase se atrapalha.

### Checklist do ensaio geral

- [ ] O tempo total ficou dentro de ±60 segundos do alvo.
- [ ] Nenhuma transição teve silêncio maior que 2 segundos.
- [ ] A demonstração do site funcionou do início ao fim sem improviso.
- [ ] Todos os preços citados bateram com a tabela oficial.
- [ ] Ninguém citou informação não confirmada (nomes, quantidade de integrantes, clientes, resultados).
- [ ] Nenhuma funcionalidade foi apresentada como pronta sem estar.
- [ ] Todos os falantes olharam para a banca, não para a tela.

### Dicas de execução no dia

- **Fale devagar nos preços e nos números.** É onde a banca presta atenção.
- **Uma ideia por slide/tela.** Se precisar escolher entre explicar e mostrar,
  mostre.
- **Se algo falhar na demo, nomeie o problema em uma frase e siga.** Exemplo:
  "O login depende de credencial externa neste ambiente — o fluxo está
  implementado e documentado." Nunca tente consertar ao vivo por mais de
  20 segundos.
- **Reserve o último minuto inteiro para o encerramento.** Apresentações que
  aceleram no fim perdem credibilidade.
- **Postura:** quem não está falando olha para quem fala, não para o chão nem
  para o celular.

## Materiais de apoio

| Material | Arquivo |
|---|---|
| Roteiro completo (13 partes) | [ROTEIRO_COMPLETO.md](./ROTEIRO_COMPLETO.md) |
| Roteiro por área | [ROTEIRO_POR_AREA.md](./ROTEIRO_POR_AREA.md) |
| Demonstração ao vivo | [ROTEIRO_DEMONSTRACAO_SITE.md](./ROTEIRO_DEMONSTRACAO_SITE.md) |
| Perguntas prováveis | [PERGUNTAS_DA_BANCA.md](./PERGUNTAS_DA_BANCA.md) |
| Respostas-modelo | [RESPOSTAS_DA_BANCA.md](./RESPOSTAS_DA_BANCA.md) |
| Resumo executivo | [RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md) |
| Plano de negócio | [PLANO_DE_NEGOCIO.md](./PLANO_DE_NEGOCIO.md) |
| Índice dos documentos | [README.md](./README.md) |

## Pendências externas que podem ser perguntadas

Diga com naturalidade, sem pedir desculpa:

- **Publicação no ar:** o site está publicado em
  <https://skill-craft-site.vercel.app> (Vercel, projeto `skill-craft-site`,
  build de produção do branch `main`). Se perguntarem do backend, diga que as
  credenciais do Supabase ainda precisam ser configuradas para login e banco em
  produção — o passo a passo está documentado.
- **Banco de dados em produção:** as migrations estão prontas e versionadas no
  repositório; aplicá-las requer um projeto Supabase ativo com o provedor
  Google habilitado.
- **Anexos e pagamentos:** fora do escopo atual, em planejamento.
