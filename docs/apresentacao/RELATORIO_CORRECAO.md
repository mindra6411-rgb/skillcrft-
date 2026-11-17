# Relatório de Correção Institucional — Skill Craft

**Data:** 17/11/2026
**Branch auditado:** `main` (commit `b71e762` — merge do PR #8)
**Escopo:** auditoria das informações publicadas + apresentação de slides de encerramento
**Regra aplicada:** nenhuma informação foi inventada, substituída por texto genérico ou completada com ficção.

---

## Resumo em uma linha

A auditoria foi executada em todo o repositório (código, dados, documentação, migrations e bundle de produção).
As informações falsas **já não existem no projeto** — a remoção definitiva foi feita no PR #7 (merge em
17/11/2026, 14:35 UTC) e esta auditoria **reconfirmou o estado atual, com evidência de execução**.

---

## 1. Quais informações falsas foram encontradas

| # | Informação inventada | Onde aparecia | Situação |
|---|---|---|---|
| 1 | Pessoas fictícias “Ethan” e “Emily” (e a variação “Emilyn”) | Seção de equipe e dados do site | Removidas no PR #7 — 0 ocorrências hoje |
| 2 | Área de “Marketing” (nunca existiu no projeto) | Página inicial, menu, cards, texto institucional | Removida no PR #7 — 0 ocorrências hoje |
| 3 | Quantidade de integrantes da equipe | Seção de equipe | Removida — nenhuma contagem é exibida |
| 4 | Cargos criados automaticamente | Seção de equipe | Removidos — a seção lista áreas, não cargos |
| 5 | Descrições institucionais sem fonte documental | Cards e páginas internas | Substituídas por conteúdo dos documentos originais |

**Verificação no estado atual (comandos executados de fato):**

- `grep -rin "ethan\|emily\|marketing" src/ supabase/ index.html public/` → **nenhum resultado**
- Varredura do bundle gerado (`dist/`) → **0 arquivos** com os três termos
- Varredura da documentação (`docs/`, `scripts/`) → só há menções em **testes e neste relatório**,
  ou seja, referências que *proíbem* os termos (ver item 11)

## 2. Quais nomes foram removidos

- **Ethan** — removido.
- **Emily** / **Emilyn** — removidos.

O site não exibe nome de nenhum integrante. A composição real da equipe permanece preservada, sem alteração,
no documento original `docs/originais/equipe_envolvidos.md`.

## 3. “Marketing” foi removido de todos os locais?

**Sim.** Nenhuma área, card, menu, rodapé, formulário, tutorial, painel ou dado de demonstração cita Marketing.
Não há resquício escondido por CSS: a origem dos dados foi corrigida em `src/config/site.ts`, que é a única
fonte de áreas, serviços, etapas, equipe e conteúdo de ajuda do site.

## 4. Como ficaram as áreas corretas

**Administração · Tecnologia da Informação · Design** — nomenclatura do responsável pelo projeto, idêntica nos
documentos originais (`modelo_de_negocio_skillscraft.md` e prompts da equipe). Sem quarta área, sem
departamento criado por conta própria.

A consistência foi conferida nos 12 pontos exigidos: página inicial, menu de navegação, apresentação
institucional, seção da equipe, cards, painel do usuário, laboratório/ferramentas, tutoriais, formulários,
rodapé, documentação e banco de dados (migrations).

## 5. Havia integrantes ou quantidades inventadas?

**Havia** (nomes e contagem) no material anterior. **Hoje não há**: a seção Equipe exibe apenas as três áreas
com a responsabilidade real de cada uma, descrita no Projeto Integrador. Nenhuma quantidade de pessoas é
informada em nenhum ponto do site. Nenhuma foto de banco de imagens representa integrantes.

## 6. Arquivos modificados nesta entrega

A auditoria não encontrou informação falsa a corrigir no código, então **nenhum arquivo de conteúdo do site
precisou ser alterado** — alterá-lo seria arriscar o que já está correto.

Arquivos **adicionados**:

| Arquivo | Função |
|---|---|
| `docs/apresentacao/apresentacao_correcao_skill_craft.pptx` | Apresentação de 12 slides (16:9), pronta para projetar |
| `docs/apresentacao/apresentacao_correcao_skill_craft.html` | Mesma apresentação em HTML, abre no navegador sem instalar nada |
| `scripts/gerar_apresentacao.py` | Gera o PPTX a partir do conteúdo verificado (regenerável) |
| `docs/apresentacao/RELATORIO_CORRECAO.md` | Este relatório |

Arquivo **atualizado**: `docs/apresentacao/README.md` (índice dos documentos da apresentação).

## 7. A página inicial foi corrigida?

**Está correta.** A checagem automatizada da home valida, a cada execução: slogan oficial, as 8 seções,
as áreas ADM/TI/Design **sem “Marketing”**, preços visíveis, **ausência de nomes de integrantes e de
contagem de pessoas**, skip-link e botões com nome acessível. Resultado: **7/7 ok**.

## 8. A versão mobile foi revisada?

**Sim.** O menu mobile acessível (`aria-expanded`, nome acessível), a navegação por âncoras, a responsividade
das seções e a ausência de rolagem horizontal fazem parte das 76 verificações executadas. A apresentação em
HTML também tem layout próprio para telas pequenas e modo de impressão/PDF.

## 9. O build foi executado com sucesso?

**Sim, executado de verdade neste ambiente:**

```
npm install   → concluído sem erro
npm run build → ✓ built in 3.88s   (tsc -b + vite build, sem erros de tipo)
npm run test:smoke → Total: 76/76 verificações ok · Resultado: APROVADO
Console: nenhum erro ou aviso inesperado durante as verificações.
```

## 10. A publicação foi atualizada?

**Sim — confirmada agora pela API da Vercel e pela leitura da página publicada.**

| Verificação | Resultado real |
|---|---|
| Deployment de produção | `dpl_EnjS3X6uBTny9ZfT6NCEA5kkt3yG` · `READY` / `PROMOTED` |
| Commit publicado | `7f83630` — o merge do PR #9, no branch `main` |
| Build na Vercel | `tsc -b && vite build` · 2129 módulos, **sem erro** |
| HTML publicado | Administração, Tecnologia da Informação e Design · **0** ocorrências de Ethan/Emily/Marketing |
| Preços publicados | R$ 15 · R$ 30 · R$ 10 · R$ 10 · R$ 15 (tabela oficial) |
| Seção Equipe publicada | três áreas, **sem nomes, sem cargos nominais, sem contagem** |

> **Correção de endereço:** o domínio de produção do projeto é **`skill-craft-site.vercel.app`**.
> O endereço `skill-craft-lime.vercel.app` citado em um pedido anterior **não pertence a este
> projeto**. Nenhum alias foi criado ou alterado para ele.

## 11. Quais problemas ainda existem

1. **Login, banco e painel estão inativos na publicação.** O conector do Supabase retornou
   **nenhum projeto** na conta (`{"items": []}`) e a Vercel tem **apenas** `VITE_SITE_URL` nas variáveis
   de ambiente. Não é um defeito do código: é configuração externa pendente. O site declara isso como
   pendência — não simula funcionamento.
2. **Inspeção em aparelho real** — layout, contraste, foco visível e desempenho de animação exigem
   navegador. A leitura da página comprova conteúdo, não estética.
3. **Nomes da equipe não divulgados** — decisão do responsável pelo projeto. O documento original está
   preservado; a seção está pronta para receber os dados quando houver autorização.
4. **Menções aos termos proibidos em testes e neste relatório** — são intencionais: funcionam como
   *trava de regressão*. O teste falha se “Ethan”, “Emily” ou “Marketing” voltarem a aparecer no site.
5. **Termo “ITI” do pedido** — não existe em nenhum documento do projeto (os documentos originais usam
   **TI**, para Tecnologia da Informação). O site mantém **TI**, conforme a nomenclatura do responsável
   pelo projeto. Se “ITI” for a nomenclatura oficial, é uma decisão de uma linha a ser confirmada.

---

## Como abrir a apresentação

- **PowerPoint / Google Slides / Keynote:** `docs/apresentacao/apresentacao_correcao_skill_craft.pptx`
- **Navegador (sem instalar nada):** `docs/apresentacao/apresentacao_correcao_skill_craft.html`
  — setas ← → para navegar, `Home`/`End` para ir ao início/fim, `Ctrl+P` para exportar em PDF.
- **Regenerar:** `pip install python-pptx && python3 scripts/gerar_apresentacao.py`

## Estrutura da apresentação (12 slides)

1. Capa — correção institucional e finalização
2. Método — auditoria primeiro, correção depois, nenhuma invenção
3. O que foi encontrado e onde estava
4. Áreas oficiais: Administração, TI e Design
5. Verificação ponta a ponta nos 12 pontos do projeto
6. A seção Equipe: nenhum nome, nenhuma quantidade
7. O que é comprovado e o que o projeto não declara
8. Serviços e preços oficiais intactos
9. Apresentação e funcionalidades conferidas
10. Resultado executado (76/76, 0 ocorrências, build limpo)
11. O que ainda depende de ação externa
12. Regra final
