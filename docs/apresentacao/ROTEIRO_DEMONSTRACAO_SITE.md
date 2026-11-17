# Roteiro de Demonstração do Site — Skill Craft

Guia para demonstrar o site **ao vivo** durante a apresentação. Abra tudo
antes de começar e mantenha este roteiro impresso ou em outra tela.

## Antes de começar (checklist)

- [ ] Internet confirmada na sala; se possível, cabo em vez de Wi-Fi.
- [ ] Site aberto em uma aba e **recarregado uma vez** (para o vídeo e as fontes entrarem em cache).
- [ ] Uma segunda aba com o site já carregado, como reserva.
- [ ] Zoom do navegador em 100–110%; tela cheia (F11) na hora da demo.
- [ ] Celular com o site aberto ao lado, para mostrar a versão mobile.
- [ ] Uma conta Google de teste já logada em outra janela anônima (se for demonstrar login).
- [ ] Apresentação alternativa offline preparada (prints das telas), caso tudo falhe.

## 1. Abrir a demonstração

> "Este é o site da Skill Craft, funcionando ao vivo." — Abra a página inicial e
> deixe a animação de abertura rodar uma vez (ela é rápida e pode ser pulada com
> Esc).
>
> Se o site ainda não estiver publicado em um domínio (a hospedagem anterior foi
> removida a pedido do cliente), demonstre a partir do servidor local
> (`npm run dev`) e diga exatamente isso: "está rodando no nosso ambiente; para
> ir ao ar falta criar o projeto de hospedagem, que já está documentado".

## 2. Página inicial

- Aponte o **hero com vídeo de fundo** e a frase oficial: *"Aprenda, desenvolva e prepare-se para o mercado."*
- Role devagar mostrando navbar com indicador de seção e o progresso de leitura no topo.
- Diga: "A identidade visual — cores, fontes e logotipo — segue o guia de marca oficial do projeto."

## 3. Serviços

- Role até **Serviços** e mostre os cinco cards com os preços de referência.
- Fale um preço em voz alta para provar legibilidade: "Sites simples, 30 reais — preço de referência, confirmado na etapa de orçamento."
- Clique em **Solicitar** em um card: mostre que o formulário abre já com o serviço pré-selecionado.

## 4. Processo de solicitação (formulário)

- Mostre **Como funciona** (cinco etapas) rapidamente.
- No formulário, preencha nome e descrição; **deixe um campo vazio de propósito** e clique em enviar para mostrar a validação com mensagem de erro.
- Corrija, escolha meio de contato e envie: mostre o **protocolo** na tela de sucesso.
- Fale: "Sem backend configurado, o pedido vira um rascunho local declarado — o site nunca finge um envio que não aconteceu."

## 5. Autenticação Google

- Clique em **Entrar com Google** e explique o fluxo OAuth: autorização na conta Google e retorno com sessão ativa.
- **Se as credenciais não estiverem configuradas no ambiente**, mostre o painel explicativo e diga: "O fluxo está implementado; neste ambiente de demonstração as credenciais do Google ainda não foram ativadas — por isso o site explica em vez de simular."

## 6. Área do aluno

- Com sessão ativa (ou explicando o estado), abra a **Área do aluno**: identificação do usuário, histórico de solicitações com protocolo, status e data, busca e filtro por status, e detalhes de cada pedido.
- Mostre o botão **Sair**.

## 7. Histórico de solicitações

- Abra os detalhes de um pedido e mostre status e meio de retorno.
- Explique os status: aguardando análise, em análise, em andamento, concluído e cancelado.

## 8. Funcionalidades disponíveis

- Passe rapidamente por: **Ferramentas do estudante** (calculadora de médias, planejador de cronograma, checklist), **Central de ajuda** e o rodapé completo.
- No celular ao lado, mostre o menu mobile aberto e um card de serviço.

## 9. Rota inexistente (404)

- Digite no navegador um endereço que não existe, acrescentando `#/qualquer-coisa`
  ao final da URL, e mostre a **página 404** da Skill Craft.
- Aponte três coisas: a mensagem clara, o endereço que falhou (o site não esconde
  o erro) e os botões de saída — início, serviços, ferramentas e ajuda.
- Fale: "Nenhuma rota inválida cai em silêncio na página inicial: isso escondiria
  link quebrado e erro de digitação."
- Clique em **Ir para o início** e mostre que a navegação volta ao normal.

## 10. Encerrar a demonstração

> "O site é a cara da Skill Craft: organizado, honesto e funcional — do
> primeiro clique ao pós-venda." — Volte ao topo e encerre a demo.

---

## Planos B (se algo falhar no dia)

| Problema | O que fazer |
|---|---|
| Internet cai | Use os prints offline preparados; descreva cada tela enquanto mostra a imagem. |
| Login Google não conclui | Não insista: explique o fluxo com o painel de configuração aberto e siga para a área do aluno em modo explicado. |
| Banco de dados indisponível | Diga que o pedido foi registrado como rascunho local (o site mostra isso com clareza) e mostre o histórico local. |
| Vídeo do hero não carrega | Sem pânico: o site exibe um pôster estático de fallback automaticamente. |
| Projetor corta a tela | Use o celular como segunda tela de demonstração (o layout é responsivo). |

**Regra:** nunca apresente como funcionando algo que o ambiente não concluiu
no momento da demo. A transparência faz parte do projeto.
