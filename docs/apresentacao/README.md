# Apresentação do Projeto — Skill Craft

Esta pasta reúne **todo o material de apresentação** da Skill Craft. Qualquer
integrante da equipe encontra aqui, em poucos cliques, o que precisa falar,
demonstrar e responder.

> **Áreas oficiais da agência** (conforme os documentos originais do projeto):
> **Design · Administração · TI**. Por decisão do responsável pelo projeto, o
> material e o site **não citam nomes de integrantes nem quantidade de pessoas**.
> A composição real da equipe está registrada em
> [`../originais/equipe_envolvidos.md`](../originais/equipe_envolvidos.md) e
> somente informações confirmadas pela equipe devem ser usadas na apresentação.

## Documentos

| # | Documento | Para quê |
|---|---|---|
| 1 | [ROTEIRO_COMPLETO.md](./ROTEIRO_COMPLETO.md) | Roteiro completo da apresentação oral, do início ao agradecimento |
| 2 | [ROTEIRO_POR_AREA.md](./ROTEIRO_POR_AREA.md) | Falas separadas por área (TI, ADM e Design), com transições entre elas |
| 3 | [ROTEIRO_DEMONSTRACAO_SITE.md](./ROTEIRO_DEMONSTRACAO_SITE.md) | Passo a passo para demonstrar o site ao vivo, com planos B |
| 4 | [PERGUNTAS_DA_BANCA.md](./PERGUNTAS_DA_BANCA.md) | 18 perguntas que professores e avaliadores costumam fazer |
| 5 | [RESPOSTAS_DA_BANCA.md](./RESPOSTAS_DA_BANCA.md) | Respostas prontas, alinhadas com a realidade do projeto |
| 6 | [RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md) | Resumo profissional do projeto em uma página |
| 7 | [PLANO_DE_NEGOCIO.md](./PLANO_DE_NEGOCIO.md) | Planejamento empresarial coerente com a proposta (simulações marcadas como hipotéticas) |
| 8 | [GUIA_DE_APRESENTACAO.md](./GUIA_DE_APRESENTACAO.md) | Ordem das falas, tempos sugeridos, transições e dicas de ensaio |

## Slides da correção institucional

| Documento | Para quê |
| --- | --- |
| 🖼️ [**Apresentação em PPTX (12 slides)**](./apresentacao_correcao_skill_craft.pptx) | Deck 16:9 pronto para projetar no PowerPoint, Google Slides ou Keynote |
| 🌐 [**Apresentação em HTML**](./apresentacao_correcao_skill_craft.html) | O mesmo deck no navegador, sem instalar nada — setas ← →, `Ctrl+P` exporta em PDF |
| 📋 [**Relatório de correção**](./RELATORIO_CORRECAO.md) | Auditoria das informações falsas, o que foi removido, evidências de build e pendências |

Novo deck gerado com:

```bash
pip install python-pptx
python3 scripts/gerar_apresentacao.py
```

> O conteúdo dos slides vem dos documentos originais desta pasta e do que está
> **verificado no repositório**. Nenhum nome, cargo, quantidade, cliente,
> depoimento ou estatística é inventado para preencher layout.

Documentos técnicos de apoio (fora desta pasta):

| Documento | Para quê |
|---|---|
| [`../../README.md`](../../README.md) | Visão geral do projeto, funcionalidades, estrutura e como executar |
| [`../TESTES.md`](../TESTES.md) | O que foi testado de verdade, com quais comandos, e o que depende de credenciais |
| [`../CONFIGURACAO.md`](../CONFIGURACAO.md) | Supabase, Google OAuth, migrações, perfil administrativo e publicação |

## Como usar em 3 passos

1. **Leia o [GUIA_DE_APRESENTACAO.md](./GUIA_DE_APRESENTACAO.md)** para ver a ordem geral e o tempo de cada parte.
2. **Cada área estuda suas falas no [ROTEIRO_POR_AREA.md](./ROTEIRO_POR_AREA.md)** e decora as transições.
3. **Ensaiem com o [ROTEIRO_DEMONSTRACAO_SITE.md](./ROTEIRO_DEMONSTRACAO_SITE.md)** aberto ao lado do computador que será usado no dia.

## O que já existe no site (pode demonstrar)

Tudo isto está implementado e testado — veja o relatório em [`../TESTES.md`](../TESTES.md):

- Página institucional com as oito seções (incluindo **Equipe** e **Recursos**).
- Formulário de solicitação com validação, prazo desejado, informações
  complementares e protocolo `SC-ANO-XXXX`.
- **Área do aluno** (`#/app`) com histórico, **busca**, **filtro por status** e
  detalhes de cada pedido.
- **Status oficiais**: aguardando análise · em análise · em andamento · concluído ·
  cancelado.
- **Ferramentas gratuitas** (`#/ferramentas`): calculadora de médias, gerador de
  cronograma de estudos e checklist de trabalho.
- **Central de ajuda** (`#/ajuda`): como pedir, como acompanhar, status e FAQ.
- **Página 404** própria, com o endereço tentado e saídas de navegação.
- **Painel administrativo** (`#/admin`) com permissão validada **no banco**.
- Login com Google implementado (OAuth real) e abertura animada que respeita
  `prefers-reduced-motion`.

## O que está pendente (diga com naturalidade, se perguntarem)

- **Publicação no ar:** ✅ resolvida — o site está publicado em
  <https://skill-craft-site.vercel.app> (Vercel, build de produção do branch
  `main`). O que ainda depende de configuração externa é o **backend**: os
  projetos Supabase usados no desenvolvimento foram removidos a pedido do
  cliente, então login, banco e painel aparecem no ar como pendência declarada —
  passo a passo em [`../CONFIGURACAO.md`](../CONFIGURACAO.md).
- **Login Google e banco em produção:** o fluxo está implementado; sem credenciais
  o site **declara** a pendência em vez de simular. Por isso a demonstração de
  login depende de um projeto Supabase ativo no dia.
- **Anexos no formulário e pagamentos:** fora do escopo atual (em planejamento).

## Divergências registradas entre documentos

| Ponto | Documento original | Decisão adotada |
|---|---|---|
| Áreas da agência | PDF do Projeto Integrador, prompts da equipe e modelo de negócio citam **Administração, TI e Design** | **Corrigido em 17/11/2026**: uma versão anterior deste material e do site citava uma área de "Marketing", que nunca existiu no projeto. As áreas oficiais são **Administração, TI e Design** em todo o material. |
| Integrantes | `../originais/equipe_envolvidos.md` registra a equipe enviada pela própria equipe | **Corrigido em 17/11/2026**: uma versão anterior citava nomes e uma composição que não foram fornecidos. Por decisão do responsável, nomes e quantidades **não aparecem** no site nem neste material; usar apenas informações confirmadas. |
| Preços e serviços | Tabela consolidada do modelo de negócio | **Inalterados** — cinco serviços com R$ 15 / R$ 30 / R$ 10 / R$ 10 / R$ 15, sempre como “preço de referência”. |
| Estimativas antigas de mentoria (R$ 50–100) e pacotes (R$ 110–400) | Nota do rascunho de ADM no modelo de negócio | **Não usadas.** Não fazem parte da tabela oficial e não aparecem no site nem nos roteiros. |

## Regras de ouro

- Fale somente do que **existe de verdade** no projeto (serviços, preços, etapas, funcionalidades).
- Não cite nomes de integrantes nem quantidade de pessoas da equipe, a menos que a própria equipe confirme no dia da apresentação.
- Não invente clientes, resultados, depoimentos, faturamento ou redes sociais.
- Se a banca perguntar algo não confirmado, diga que é um **ponto em planejamento** — as respostas-modelo estão em [RESPOSTAS_DA_BANCA.md](./RESPOSTAS_DA_BANCA.md).
- O site, os documentos originais e o código ficam na raiz do repositório; esta pasta é o material de fala.
