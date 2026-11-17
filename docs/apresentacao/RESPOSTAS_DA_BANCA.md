# Respostas da Banca — Skill Craft

Respostas-modelo alinhadas **à realidade do projeto**. Onde algo ainda não
está implementado ou confirmado, isso está marcado explicitamente como
**"em planejamento"** ou **"depende de configuração externa"** — a regra é
nunca apresentar como pronto o que não está pronto.

---

## Perguntas gerais

### 1. O que é a Skill Craft e qual problema ela resolve?

A Skill Craft é uma agência estudantil de serviços digitais com três áreas de
atuação: Tecnologia da Informação, Administração e Marketing. Ela resolve um
problema duplo: de um lado, alunos que precisam de apresentações, sites
simples, revisões, resumos e artes — e não sabem a quem recorrer com
confiança e preço acessível; do outro, estudantes que querem experiência
profissional real ainda durante a formação. Os serviços oficiais, com preço
de referência: apresentações (R$ 15), sites simples (R$ 30), revisão de
trabalhos (R$ 10), resumos técnicos (R$ 10) e artes e logotipos (R$ 15).

### 2. Por que uma agência estudantil dentro da escola?

Porque o ambiente escolar é o lugar onde os dois lados do problema se
encontram: quem precisa do serviço e quem pode executá-lo estão no mesmo
corredor. Uma agência estudantil permite praticar gestão, atendimento,
tecnologia e comunicação com stakes reais — prazos reais, clientes reais —
sem exigir estrutura empresarial.

### 3. Como vocês se organizam entre as três áreas?

Seis integrantes, três áreas com papéis definidos: TI (2 integrantes)
desenvolve e mantém o site, a autenticação, o banco e as ferramentas de
estudo; ADM (3 integrantes) organiza serviços, processos, pedidos e o
controle financeiro; Marketing (1 integrante) cuida da identidade, da
comunicação e de como os serviços são apresentados. As etapas do atendimento
— escolha, envio das informações, orçamento, desenvolvimento, entrega e
pós-venda — conectam as áreas em um fluxo único.

### 4. Qual foi a maior dificuldade do projeto como um todo?

Manter honestidade técnica. Foi fácil demais criar telas bonitas que fingem
funcionar. A decisão difícil — e a que mais nos orgulha — foi fazer o site
**declarar** seu próprio estado: sem credenciais configuradas, ele explica em
vez de simular login; sem backend, o pedido vira rascunho local anunciado.
Isso custou mais trabalho e menos "efeito", mas garantiu que nada fosse
apresentado como pronto sem estar.

---

## Perguntas sobre o site

### 5. Por que React em vez de um site pronto?

Porque o objetivo do projeto é aprendizado técnico, não apenas ter um site no
ar. React com TypeScript e componentes reutilizáveis nos dá controle total
sobre identidade visual, comportamento do formulário, autenticação e área do
aluno — coisas que plataformas prontas limitam. Vite mantém o build rápido e
Tailwind aplica o design system oficial (cores, sombras e tipografia do guia
de marca) de forma consistente.

### 6. O site é responsivo? Testaram em quais dispositivos?

Sim. O layout foi revisado de 360 px (celulares Android e iPhone menores)
até 1440 px (monitores), passando por tablet e notebook, sem scroll
horizontal em nenhuma faixa. O menu vira painel mobile com botão acessível,
os cards de serviço reorganizam em coluna única e o vídeo do hero mantém
pôster de fallback. *Testes em dispositivos físicos específicos: em
planejamento — a validação feita foi por faixas de largura e inspeção de
todas as seções.*

### 7. Como funciona a animação de abertura? Ela atrapalha a navegação?

É uma sequência curta (poucos segundos) que constrói o símbolo SC da marca e
é exibida uma única vez por sessão — o navegador guarda que ela já foi vista
e não repete. Ela pode ser pulada com Esc e, se o usuário tem a preferência
de sistema "reduzir movimento", a animação simplesmente não aparece. O site
inteiro funciona com animações desativadas.

### 8. O que acontece se o aluno digitar um endereço que não existe?

O site mostra uma página **404 própria**, com a identidade da marca,
mensagem clara e botões para voltar ao início e navegar para as principais
seções. Rotas desconhecidas não são redirecionadas silenciosamente para a
home — isso escondiria erros de digitação e links quebrados. O roteamento usa
hash (`#/rota`), então atualização direta da página e o botão voltar do
navegador funcionam sem configuração extra de servidor.

### 9. Como cuidaram de acessibilidade e desempenho?

Acessibilidade: navegação completa por teclado com estados de foco visíveis,
campos com rótulos associados e mensagens de erro descritivas, contrastes
verificados entre texto e fundo, textos alternativos nos símbolos da marca,
botão de menu com nome acessível e respeito a `prefers-reduced-motion`.
Desempenho: fontes hospedadas localmente, vídeo de fundo otimizado (loop de
12 s, sem áudio, menos de 500 KB, com pôster e pausa quando fora da tela),
código dividido por rotas (área do aluno e bibliotecas só carregam quando
usadas) e animações limitadas a transform/opacity para não causar travamentos
em celulares.

---

## Perguntas técnicas (TI)

### 10. Como funciona o login com Google? Onde ficam as chaves?

Usamos Supabase Auth com o provedor Google, no fluxo OAuth real: o aluno
autoriza na página do Google e retorna ao site com a sessão criada e
persistida de forma segura. No frontend ficam apenas a URL do projeto e a
**chave anônima** (anon key), que é pública por design e só permite o que as
regras do banco autorizam. A chave de serviço (service_role), que teria poder
total, nunca vai para o frontend. As credenciais ficam em variáveis de
ambiente — nada de chave no código versionado.

### 11. Um aluno consegue ver os pedidos de outro aluno no banco?

Não. A tabela `solicitacoes` tem Row Level Security ativado com políticas que
garantem: cada aluno lê apenas os próprios pedidos (filtrados pelo id de
usuário autenticado), insere pedidos com o próprio id e não atualiza nem
apaga nada alheio. A permissão é aplicada **no banco**, não por esconder
botões na tela — mesmo que alguém manipule o código do navegador, o banco
continua negando. A leitura administrativa é restrita a perfis de
administração validados no próprio banco.

### 12. O que acontece se o banco de dados estiver fora do ar?

O site degrada com honestidade: o formulário avisa que o pedido não pôde ser
gravado e o registra como rascunho local no navegador, com aviso visual
explícito; a área do aluno mostra o estado disponível e informa a
instabilidade em vez de exibir uma lista vazia enganosa. Nada é perdido
silenciosamente e nenhum erro é mascarado.

### 13. Por que o formulário tem validação? O que ela impede?

Validação campo a campo impede pedidos incompletos ou inúteis — sem nome, sem
descrição, sem meio de contato — e erros de formato em telefone/e-mail. Cada
campo exibe mensagem específica no momento do erro, o campo é destacado e o
foco é levado até ele (acessível para leitores de tela). Pedidos bem formados
reduzem retrabalho da ADM e do aluno. Não coletamos dado pessoal
desnecessário: apenas nome, contato de retorno e descrição do serviço.

### 14. Como geraram e otimizaram o vídeo de fundo?

O vídeo foi gerado por um script em Python que compõe os elementos da
identidade (símbolo, paleta e padrões) em um loop contínuo de 12 segundos,
1280×720, sem áudio, com menos de meio megabyte. No site ele roda em mudo, em
loop, com `playsinline` (essencial no iOS), pôster estático de fallback,
camada escura para garantir contraste do texto e pausa automática quando sai
da tela — para não gastar bateria nem processamento à toa.

---

## Perguntas de ADM

### 15. Como controlam pedidos, status e finanças?

Cada pedido recebe um protocolo no formato `SC-ANO-XXXX` e entra no
acompanhamento com status: **aguardando análise, em análise, em andamento,
concluído** ou **cancelado**. O aluno acompanha tudo na própria área, com
busca e filtro. O controle financeiro registra entradas por serviço e
despesas quando existem; como a operação é digital e sob demanda, os custos
fixos são baixos, e todo valor é confirmado com o aluno na etapa de
orçamento.

### 16. Como definiram os preços de referência?

Os preços são os oficiais do projeto e não são alterados: apresentações
R$ 15, sites simples R$ 30, revisão de trabalhos R$ 10, resumos técnicos
R$ 10, artes e logotipos R$ 15. São comunicados como **preço de referência**,
confirmado na etapa de orçamento conforme o escopo pedido — sem descontos,
promoções ou planos.

---

## Perguntas de Marketing

### 17. Como divulgam a Skill Craft para os alunos?

O foco é onde o público está: divulgação dentro da própria escola, indicação
entre turmas, conteúdo educativo produzido pelas três áreas e presença
digital organizada pela equipe de Marketing. Cada serviço entregue bem vira
portfólio e indicação. *Perfis em redes sociais: ainda não publicados — em
planejamento; não apresentamos redes fictícias.*

### 18. Qual a diferença da Skill Craft para um "freelancer qualquer"?

Três diferenças concretas: (1) **processo** — cinco etapas documentadas, com
protocolo e status que o aluno acompanha, em vez de conversa solta; (2)
**transparência** — preços de referência públicos e pedido confirmado antes
de começar; (3) **estrutura** — três áreas que se completam, então o mesmo
lugar resolve a apresentação, o resumo e a arte da marca, com uma identidade
visual consistente.

---

## Pontos a declarar como pendentes (se a banca perguntar)

- **Hospedagem pública:** o projeto Vercel anterior foi removido a pedido do
  cliente na fase de desmobilização; a publicação atual depende de criar um
  novo projeto de hospedagem e configurar as credenciais do Supabase
  (passo a passo documentado em `docs/CONFIGURACAO.md`).
- **Banco em produção:** as migrations existem e estão versionadas; aplicá-las
  requer um projeto Supabase ativo.
- **Anexos no formulário:** em planejamento (exige bucket de armazenamento e
  verificação de tipo/tamanho).
- **Pagamentos:** fora do escopo — não há cobrança automatizada; valores são
  combinados na etapa de orçamento.
