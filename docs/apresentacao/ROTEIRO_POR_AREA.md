# Roteiro por Área — Skill Craft

Cada área encontra aqui as próprias falas, na ordem em que entram na
apresentação. As **transições** (em itálico) conectam uma área à outra para a
apresentação soar como uma explicação conjunta.

Áreas oficiais: **Administração · TI · Design** (conforme os documentos
originais do projeto). Não cite nomes de integrantes nem quantidade de
pessoas; fale "a equipe de ADM", "a equipe de TI" e "a equipe de Design".

---

## Parte da TI (divida os blocos entre os integrantes da área)

### Bloco 1 — Desenvolvimento do site *(abre a demonstração técnica)*

> "A parte técnica da Skill Craft é o site institucional. Ele foi desenvolvido
> do zero pela nossa equipe de TI, com organização em componentes
> reutilizáveis: cada seção da página — hero, serviços, como funciona,
> contato — é um componente próprio, o que facilita manter e evoluir o projeto."

### Bloco 2 — Tecnologias utilizadas

> "Usamos React com TypeScript para a interface, Vite como ferramenta de
> build, Tailwind CSS para o design system com as cores oficiais da marca,
> Framer Motion para as animações e ícones da biblioteca Lucide. As fontes
> oficiais — Montserrat, Roboto e Lato — ficam hospedadas no próprio projeto,
> então o site não depende de serviços externos para carregar a tipografia."

### Bloco 3 — Funcionalidades

> "O site tem navegação suave entre seções, menu responsivo para celular,
> formulário de solicitação com validação campo a campo e mensagens de erro
> claras, estados de carregamento e sucesso com protocolo, e uma abertura
> animada que constrói o símbolo da marca — e que respeita a preferência de
> movimento reduzido do usuário."

### Bloco 4 — Autenticação

> "A autenticação é feita com contas Google, usando o Supabase Auth. O fluxo
> é o OAuth real: o aluno clica em 'Entrar com Google', autoriza, e volta para
> o site já com sessão ativa. A sessão é persistida com segurança e o logout
> está disponível na área do aluno. Quando o ambiente ainda não tem as
> credenciais configuradas, o site avisa com clareza em vez de simular um
> login falso — essa foi uma decisão consciente de honestidade técnica."

### Bloco 5 — Banco de dados

> "As solicitações são gravadas no banco do Supabase, na tabela
> 'solicitacoes', criada por migrations versionadas que estão no repositório.
> O banco aplica segurança em nível de linha, o RLS: cada aluno logado
> consegue ler apenas os próprios pedidos, e o painel administrativo só lê e
> atualiza pedidos quem tem perfil de administração — a regra vale no banco,
> não só na tela."

### Bloco 6 — Ferramentas digitais

> "Além do site, desenvolvemos ferramentas gratuitas para estudantes:
> calculadora de médias com pesos, planejador de cronograma de estudos e
> checklist de trabalhos. Elas rodam no navegador, salvam os dados localmente
> no dispositivo do aluno e não pedem nenhuma informação pessoal."

### Bloco 7 — Desafios técnicos

> "Os maiores desafios foram três: construir uma animação de abertura leve e
> acessível; gerar e otimizar o vídeo de fundo do hero — que é um loop de 12
> segundos, sem áudio, com menos de meio megabyte; e tratar todos os cenários
> de navegação, incluindo página não encontrada, retorno do login e
> atualização direta da página."

### Bloco 8 — Melhorias e possibilidades futuras

> "Para frente, a evolução natural é ampliar as ferramentas de estudo,
> permitir anexos seguros nos pedidos com armazenamento em bucket dedicado e
> métricas de atendimento no painel. Tudo já pensado dentro da mesma
> arquitetura, sem precisar recomeçar nada."

*Transição para ADM: "Mas tecnologia sozinha não segura uma iniciativa de pé.
Quem organiza serviços, pedidos e dinheiro é a Administração — com a palavra,
a equipe de ADM."*

---

## Parte da ADM (divida os blocos entre os integrantes da área)

### Bloco 1 — Organização da empresa e planejamento

> "A Administração trata a Skill Craft como uma iniciativa organizada desde o
> primeiro dia: missão escrita, público-alvo definido, serviços catalogados e
> etapas de atendimento documentadas. Planejamento, para nós, é isso: saber
> antes o que precisa acontecer para cada pedido chegar bem no final."

### Bloco 2 — Gestão e organização dos serviços

> "Cada serviço tem descrição, preço de referência e área responsável. Essa
> tabela oficial é a mesma que aparece no site — não existe preço 'de boca'.
> Quando entra um pedido, ele recebe um protocolo e entra na fila de
> acompanhamento, com status: aguardando análise, em análise, em andamento,
> concluído ou cancelado."

### Bloco 3 — Controle financeiro

> "O controle financeiro é simples e registrado: entradas por serviço
> prestado, despesas quando existem — ferramentas, materiais, divulgação — e
> o saldo organizado pela equipe de ADM. Como a operação é digital e os
> serviços são sob demanda, os custos fixos são baixos, e todo valor é
> combinado com o aluno antes, na etapa do orçamento."

### Bloco 4 — Processos internos e atendimento

> "O atendimento segue cinco etapas: escolha do serviço, envio das
> informações, orçamento, desenvolvimento e entrega com pós-venda. Esse
> processo protege os dois lados: o aluno sabe o que esperar, e a equipe sabe
> o que entregar. O pós-venda, com coleta de feedback, é o que melhora o
> próximo pedido."

### Bloco 5 — Organização das solicitações

> "As solicitações chegam pelo formulário do site com tudo o que a equipe
> precisa: serviço, descrição, prazo desejado e meio de contato de retorno.
> Isso evita retrabalho de ficar perguntando o básico depois. A ADM confere,
> distribui para a área executora e acompanha até a conclusão."

*Transição para Design: "Serviço organizado e bem feito precisa ser
reconhecido por quem precisa dele. É aí que entra o Design — com a palavra,
a equipe de Design."*

---

## Parte do DESIGN

### Bloco 1 — Identidade visual da marca

> "O Design da Skill Craft começa pela própria marca: o símbolo SC em
> hexágono isométrico, a paleta Electric Blue com Deep Slate, Skill Blue e
> Accent Blue, e as tipografias Montserrat, Roboto e Lato. Tudo isso está
> registrado no guia de identidade visual da marca, que define como o
> logotipo e as cores podem ser aplicados."

### Bloco 2 — Artes, logotipos e materiais de divulgação

> "É o Design que cria os materiais básicos de divulgação da agência: peças
> para redes sociais e cartazes, além dos serviços de artes e logotipos que
> estão na tabela oficial. A regra é a mesma da marca: consistência visual
> em tudo o que sai da Skill Craft."

### Bloco 3 — Apresentação visual dos serviços

> "No site, cada serviço é apresentado com três coisas: o que é, para que
> serve e quanto custa de referência — com ícones e layout que seguem a
> identidade visual. Clareza vale mais que efeito: o aluno entende em
> segundos e decide com confiança."

### Bloco 4 — Divulgação e alcance do público

> "A divulgação pensada para o projeto é orgânica e está onde o público
> está: a própria escola, indicações entre turmas e presença digital — com
> os materiais visuais criados pelo Design. Cada serviço entregue bem vira
> portfólio e indicação, que é o canal de crescimento mais forte para uma
> iniciativa estudantil."

*Transição de fechamento: "E é assim que as três áreas se completam: TI
constrói, ADM organiza, Design dá identidade — uma única Skill Craft."*
