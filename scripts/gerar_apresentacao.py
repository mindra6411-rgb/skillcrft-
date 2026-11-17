#!/usr/bin/env python3
"""
Gera a apresentação de slides da correção institucional da Skill Craft.

Uso:
    python3 scripts/gerar_apresentacao.py

Saída: docs/apresentacao/apresentacao_correcao_skill_craft.pptx

Todo o conteúdo segue os documentos originais (docs/originais/) e o que está
verificado no repositório. Nenhum nome, quantidade de integrantes, cargo,
cliente, depoimento, estatística ou departamento é inventado.
"""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "docs" / "apresentacao" / "apresentacao_correcao_skill_craft.pptx"

# ---------------------------------------------------------------- identidade
DEEP = RGBColor(0x10, 0x1B, 0x3D)      # Deep Slate
SKILL = RGBColor(0x31, 0x55, 0xD9)     # Skill Blue
ACCENT = RGBColor(0x6B, 0x8C, 0xFF)    # Accent Blue
CHARCOAL = RGBColor(0x20, 0x23, 0x2C)  # Dark Charcoal
OFFWHITE = RGBColor(0xF7, 0xF8, 0xFC)  # Off-White
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
OK = RGBColor(0x1E, 0x8E, 0x5A)        # verde de confirmação
WARN = RGBColor(0xB4, 0x6A, 0x00)      # âmbar de pendência

TITULO = "Montserrat"
CORPO = "Lato"

L = Inches(13.333)
A = Inches(7.5)

prs = Presentation()
prs.slide_width = L
prs.slide_height = A
BRANCO = prs.slide_layouts[6]


# ------------------------------------------------------------------ helpers
def slide(fundo=OFFWHITE):
    s = prs.slides.add_slide(BRANCO)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, L, A)
    bg.fill.solid()
    bg.fill.fore_color.rgb = fundo
    bg.line.fill.background()
    bg.shadow.inherit = False
    return s


def caixa(s, x, y, w, h):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return tf


def texto(tf, txt, *, size=16, cor=CHARCOAL, bold=False, fonte=CORPO,
          espaco=6, primeiro=False, align=PP_ALIGN.LEFT, italico=False, altura=1.15):
    p = tf.paragraphs[0] if primeiro else tf.add_paragraph()
    p.alignment = align
    p.line_spacing = altura
    p.space_after = Pt(espaco)
    r = p.add_run()
    r.text = txt
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italico
    r.font.color.rgb = cor
    r.font.name = fonte
    return p


def retangulo(s, x, y, w, h, cor, *, linha=None, raio=False, alpha_solido=True):
    forma = MSO_SHAPE.ROUNDED_RECTANGLE if raio else MSO_SHAPE.RECTANGLE
    sh = s.shapes.add_shape(forma, Inches(x), Inches(y), Inches(w), Inches(h))
    if raio:
        try:
            sh.adjustments[0] = 0.08
        except (IndexError, KeyError):
            pass
    sh.fill.solid()
    sh.fill.fore_color.rgb = cor
    if linha:
        sh.line.color.rgb = linha
        sh.line.width = Pt(1)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    return sh


def trilho(s, *, kicker, titulo, sub=None, cor_kicker=SKILL, cor_titulo=DEEP):
    tf = caixa(s, 0.9, 0.62, 11.5, 1.4)
    texto(tf, kicker.upper(), size=12, cor=cor_kicker, bold=True, fonte=TITULO,
          espaco=8, primeiro=True)
    texto(tf, titulo, size=30, cor=cor_titulo, bold=True, fonte=TITULO, espaco=0, altura=1.05)
    if sub:
        tf2 = caixa(s, 0.9, 1.92, 11.3, 0.7)
        texto(tf2, sub, size=13.5, cor=CHARCOAL, primeiro=True, altura=1.25)


def rodape(s, numero, escuro=False):
    cor = RGBColor(0x9A, 0xA4, 0xC4) if escuro else RGBColor(0x8A, 0x8F, 0x9E)
    tf = caixa(s, 0.9, 6.86, 8, 0.3)
    texto(tf, "Skill Craft · Correção institucional e finalização · 17/11/2026",
          size=9.5, cor=cor, primeiro=True)
    tf2 = caixa(s, 11.6, 6.86, 0.85, 0.3)
    texto(tf2, f"{numero:02d}", size=10, cor=cor, bold=True, fonte=TITULO,
          primeiro=True, align=PP_ALIGN.RIGHT)


def cartao(s, x, y, w, h, *, titulo, corpo, destaque=None, cor_titulo=DEEP, fill=WHITE):
    retangulo(s, x, y, w, h, fill, linha=RGBColor(0xDD, 0xE2, 0xF0), raio=True)
    if destaque:
        retangulo(s, x, y + 0.28, 0.09, h - 0.56, destaque)
    tf = caixa(s, x + 0.42, y + 0.34, w - 0.8, h - 0.6)
    texto(tf, titulo, size=15.5, cor=cor_titulo, bold=True, fonte=TITULO,
          espaco=7, primeiro=True, altura=1.1)
    texto(tf, corpo, size=11.5, cor=CHARCOAL, altura=1.3, espaco=0)


def tabela(s, x, y, w, h, *, cols, linhas, larguras=None, cor_head=DEEP):
    total = len(linhas) + 1
    g = s.shapes.add_table(total, len(cols), Inches(x), Inches(y), Inches(w), Inches(h)).table
    if larguras:
        for i, larg in enumerate(larguras):
            g.columns[i].width = Inches(larg)
    for j, c in enumerate(cols):
        cel = g.cell(0, j)
        cel.text = ""
        cel.fill.solid()
        cel.fill.fore_color.rgb = cor_head
        cel.vertical_anchor = MSO_ANCHOR.MIDDLE
        cel.margin_left = cel.margin_right = Inches(0.12)
        tf = cel.text_frame
        texto(tf, c, size=11.5, cor=WHITE, bold=True, fonte=TITULO, primeiro=True, espaco=0)
    for i, linha in enumerate(linhas, start=1):
        for j, val in enumerate(linha):
            cel = g.cell(i, j)
            cel.text = ""
            cel.fill.solid()
            cel.fill.fore_color.rgb = WHITE if i % 2 else RGBColor(0xF2, 0xF5, 0xFD)
            cel.vertical_anchor = MSO_ANCHOR.MIDDLE
            cel.margin_left = cel.margin_right = Inches(0.12)
            tf = cel.text_frame
            cor = OK if isinstance(val, tuple) else CHARCOAL
            txt = val[0] if isinstance(val, tuple) else val
            negrito = isinstance(val, tuple)
            texto(tf, txt, size=11, cor=cor, bold=negrito, primeiro=True, espaco=0, altura=1.15)
    return g


def pildora(s, x, y, txt, *, cor=SKILL, w=None, size=10.5):
    largura = w if w else max(1.1, 0.098 * len(txt) + 0.5)
    retangulo(s, x, y, largura, 0.34, cor, raio=True)
    tf = caixa(s, x, y + 0.085, largura, 0.25)
    texto(tf, txt, size=size, cor=WHITE, bold=True, fonte=TITULO, primeiro=True,
          espaco=0, align=PP_ALIGN.CENTER)
    return largura


def logo(s, arquivo, x, y, largura):
    caminho = RAIZ / "public" / "brand" / arquivo
    if caminho.exists():
        s.shapes.add_picture(str(caminho), Inches(x), Inches(y), width=Inches(largura))


# =====================================================================  01
s = slide(DEEP)
retangulo(s, 0, 0, 0.14, 7.5, SKILL)
logo(s, "logo-white.png", 0.95, 0.85, 2.5)
tf = caixa(s, 0.95, 3.05, 8.6, 2.3)
texto(tf, "CORREÇÃO INSTITUCIONAL E FINALIZAÇÃO", size=12.5, cor=ACCENT, bold=True,
      fonte=TITULO, espaco=14, primeiro=True)
texto(tf, "Skill Craft:\nverdade do projeto,\nsem informação inventada", size=40, cor=WHITE,
      bold=True, fonte=TITULO, espaco=0, altura=1.06)
retangulo(s, 0.95, 5.55, 1.7, 0.05, SKILL)
tf = caixa(s, 0.95, 5.85, 9.2, 1.0)
texto(tf, "“Aprenda, desenvolva e prepare-se para o mercado.”", size=15, cor=ACCENT,
      italico=True, primeiro=True, espaco=8)
texto(tf, "Projeto Integrador 2026 · Administração · Tecnologia da Informação · Design",
      size=11.5, cor=RGBColor(0xB8, 0xC2, 0xDE), espaco=0)
retangulo(s, 9.55, 5.55, 2.8, 0.02, RGBColor(0x2C, 0x3A, 0x63))
tf = caixa(s, 9.55, 5.85, 2.9, 1.0)
texto(tf, "Apresentação da auditoria\ne das correções aplicadas", size=11.5,
      cor=RGBColor(0xB8, 0xC2, 0xDE), primeiro=True, espaco=0, altura=1.3)

# =====================================================================  02
s = slide()
trilho(s, kicker="O que esta apresentação responde",
       titulo="Auditoria primeiro. Correção depois. Nenhuma invenção.",
       sub="A ordem de trabalho pedida foi seguida à risca: nenhuma funcionalidade nova foi criada antes de resolver as informações falsas.")
itens = [
    ("1", "Auditoria completa", "Busca por nomes, cargos, quantidades e áreas inexistentes em código, dados, documentação e bundle de produção."),
    ("2", "Correção na origem", "Conteúdo fictício removido na fonte — não escondido com CSS, não escondido no componente vizinho."),
    ("3", "Fidelidade ao projeto", "Áreas, serviços e preços mantidos exatamente como nos documentos originais da equipe."),
    ("4", "Verificação", "Build, checagem de tipos e 76 verificações automatizadas executadas de verdade."),
]
y = 2.95
for i, (n, t, d) in enumerate(itens):
    x = 0.9 + i * 3.0
    retangulo(s, x, y, 2.72, 2.55, WHITE, linha=RGBColor(0xDD, 0xE2, 0xF0), raio=True)
    tf = caixa(s, x + 0.32, y + 0.3, 2.1, 0.5)
    texto(tf, n, size=26, cor=ACCENT, bold=True, fonte=TITULO, primeiro=True, espaco=0)
    tf2 = caixa(s, x + 0.32, y + 0.92, 2.15, 1.5)
    texto(tf2, t, size=14, cor=DEEP, bold=True, fonte=TITULO, primeiro=True, espaco=6, altura=1.1)
    texto(tf2, d, size=10.5, cor=CHARCOAL, altura=1.28, espaco=0)
tf = caixa(s, 0.9, 5.85, 11.5, 0.7)
texto(tf, "Regra que orientou todo o trabalho: é melhor apresentar menos informações do que publicar informações falsas.",
      size=12.5, cor=SKILL, bold=True, primeiro=True, altura=1.25)
rodape(s, 2)

# =====================================================================  03
s = slide(DEEP)
trilho(s, kicker="Prioridade 1 · resultado", titulo="O que foi encontrado e onde estava",
       cor_kicker=ACCENT, cor_titulo=WHITE)
tabela(s, 0.9, 2.05, 11.5, 3.5,
       cols=["Informação inventada", "Onde aparecia", "Situação hoje"],
       linhas=[
           ["“Ethan” — pessoa fictícia", "Seção de equipe / dados do site", ("Removido",)],
           ["“Emily” / “Emilyn” — pessoa fictícia", "Seção de equipe / textos de apoio", ("Removido",)],
           ["Área de “Marketing”", "Página inicial, menu, cards, texto institucional", ("Removida",)],
           ["Quantidade de integrantes e cargos", "Seção de equipe", ("Removidos",)],
           ["Descrições institucionais sem fonte", "Cards e páginas internas", ("Substituídas por conteúdo documentado",)],
       ],
       larguras=[4.3, 5.0, 2.2])
tf = caixa(s, 0.9, 5.95, 11.4, 0.8)
texto(tf, "A correção definitiva foi registrada no PR #7 (merge em 17/11/2026). Esta auditoria reconfirmou, no estado atual do repositório, que nada disso permanece.",
      size=11.5, cor=RGBColor(0xB8, 0xC2, 0xDE), primeiro=True, altura=1.3)
rodape(s, 3, escuro=True)

# =====================================================================  04
s = slide()
trilho(s, kicker="Prioridade 1 · correção", titulo="Áreas oficiais: Administração, TI e Design",
       sub="Nomenclatura do responsável pelo projeto, preservada nos documentos originais. Marketing nunca existiu no projeto.")
areas = [
    ("ADM", "Administração",
     "Modelo do negócio, público-alvo, serviços, preços e fluxo de atendimento.", SKILL),
    ("TI", "Tecnologia da Informação",
     "Presença digital: site, autenticação, banco de dados e ferramentas.", DEEP),
    ("Design", "Design",
     "Identidade visual, logotipo, paleta oficial e peças de divulgação.", ACCENT),
]
for i, (sigla, nome, desc, cor) in enumerate(areas):
    x = 0.9 + i * 3.92
    retangulo(s, x, 3.0, 3.6, 2.5, WHITE, linha=RGBColor(0xDD, 0xE2, 0xF0), raio=True)
    retangulo(s, x, 3.0, 3.6, 0.1, cor)
    tf = caixa(s, x + 0.35, 3.32, 2.95, 1.9)
    texto(tf, sigla, size=10, cor=cor, bold=True, fonte=TITULO, primeiro=True, espaco=5)
    texto(tf, nome, size=16, cor=DEEP, bold=True, fonte=TITULO, espaco=8, altura=1.1)
    texto(tf, desc, size=11.5, cor=CHARCOAL, altura=1.3, espaco=0)
tf = caixa(s, 0.9, 5.85, 11.5, 0.85)
texto(tf, "Sem “Marketing”. Sem quarta área. Sem departamento criado por conta própria.",
      size=13, cor=SKILL, bold=True, primeiro=True, espaco=5)
texto(tf, "Os três nomes aparecem iguais na página inicial, no menu, nos cards, no painel, no laboratório, nos tutoriais, nos formulários, no rodapé, na documentação e nos dados de demonstração.",
      size=11, cor=CHARCOAL, altura=1.25)
rodape(s, 4)

# =====================================================================  05
s = slide()
trilho(s, kicker="Verificação ponta a ponta", titulo="Mesma organização em todos os pontos do projeto",
       sub="Cada local foi conferido individualmente — a consistência não ficou só na página inicial.")
locais = [
    "Página inicial", "Menu de navegação", "Apresentação institucional",
    "Seção da equipe", "Cards de serviço", "Painel do usuário",
    "Laboratório e ferramentas", "Tutoriais e ajuda", "Formulários",
    "Rodapé", "Documentação", "Banco de dados e migrations",
]
for i, nome in enumerate(locais):
    col, lin = i % 3, i // 3
    x = 0.9 + col * 3.92
    y = 2.95 + lin * 0.86
    retangulo(s, x, y, 3.6, 0.68, WHITE, linha=RGBColor(0xDD, 0xE2, 0xF0), raio=True)
    retangulo(s, x + 0.26, y + 0.24, 0.2, 0.2, OK, raio=True)
    tf = caixa(s, x + 0.62, y + 0.2, 2.75, 0.4)
    texto(tf, nome, size=11.5, cor=CHARCOAL, bold=True, primeiro=True, espaco=0)
tf = caixa(s, 0.9, 6.35, 11.4, 0.4)
texto(tf, "Sem nomes antigos escondidos em componentes que não aparecem na página inicial.",
      size=11, cor=RGBColor(0x6B, 0x70, 0x80), italico=True, primeiro=True)
rodape(s, 5)

# =====================================================================  06
s = slide()
trilho(s, kicker="Atenção especial", titulo="A seção Equipe: nenhum nome, nenhuma quantidade",
       sub="Sem informações confirmadas para divulgação, a seção não foi preenchida com personagens. Ficou pronta para receber dados reais.")
passos = [
    ("O que saiu", "Nomes inventados, cargos criados automaticamente, contagem de pessoas e fotos de banco de imagens representando integrantes.", WARN),
    ("O que ficou", "As três áreas de atuação com a responsabilidade real de cada uma, descrita no Projeto Integrador.", OK),
    ("O que não foi feito", "Nenhuma história pessoal, qualificação, experiência profissional ou depoimento foi criado.", DEEP),
]
for i, (t, d, cor) in enumerate(passos):
    cartao(s, 0.9 + i * 3.92, 3.0, 3.6, 2.35, titulo=t, corpo=d, destaque=cor)
retangulo(s, 0.9, 5.7, 11.5, 1.0, RGBColor(0xEC, 0xF0, 0xFB), raio=True)
tf = caixa(s, 1.2, 5.92, 10.9, 0.7)
texto(tf, "A composição real da equipe continua preservada no documento original (docs/originais/equipe_envolvidos.md) e só será divulgada quando a equipe autorizar.",
      size=11.5, cor=DEEP, primeiro=True, altura=1.3)
rodape(s, 6)

# =====================================================================  07
s = slide(DEEP)
trilho(s, kicker="Critério de verdade", titulo="O que é comprovado — e o que o projeto não declara",
       cor_kicker=ACCENT, cor_titulo=WHITE)
retangulo(s, 0.9, 2.15, 5.55, 3.75, RGBColor(0x18, 0x27, 0x50), raio=True)
tf = caixa(s, 1.25, 2.45, 4.9, 3.2)
texto(tf, "COMPROVADO PELOS DOCUMENTOS", size=10.5, cor=ACCENT, bold=True,
      fonte=TITULO, primeiro=True, espaco=12)
for linha in [
    "Missão, público-alvo e três áreas",
    "Cinco serviços e preços de referência",
    "Cinco etapas do atendimento",
    "Logotipo, paleta e tipografia oficiais",
    "Funcionalidades implementadas no site",
]:
    texto(tf, "—  " + linha, size=12, cor=WHITE, espaco=9, altura=1.2)
retangulo(s, 6.85, 2.15, 5.55, 3.75, RGBColor(0x18, 0x27, 0x50), raio=True)
tf = caixa(s, 7.2, 2.45, 4.9, 3.2)
texto(tf, "NÃO DECLARADO PELO PROJETO", size=10.5, cor=RGBColor(0xF0, 0xB4, 0x6A), bold=True,
      fonte=TITULO, primeiro=True, espaco=12)
for linha in [
    "Nomes e quantidade de integrantes",
    "Clientes atendidos e depoimentos",
    "Faturamento e resultados comerciais",
    "Estatísticas de desempenho",
    "Cargos e histórias pessoais",
]:
    texto(tf, "—  " + linha, size=12, cor=RGBColor(0xD8, 0xDF, 0xF2), espaco=9, altura=1.2)
tf = caixa(s, 0.9, 6.15, 11.5, 0.5)
texto(tf, "Se a informação não existe, o campo fica de fora. O layout não é preenchido com ficção.",
      size=12, cor=ACCENT, bold=True, primeiro=True)
rodape(s, 7, escuro=True)

# =====================================================================  08
s = slide()
trilho(s, kicker="Preservado, não reformulado", titulo="Serviços e preços oficiais continuam intactos",
       sub="Tabela consolidada pela equipe (servicos_precos.xlsx). Nenhum valor foi alterado, criado ou removido.")
tabela(s, 0.9, 2.85, 8.1, 2.6,
       cols=["Serviço", "Preço de referência"],
       linhas=[
           ["Criação de apresentações", "R$ 15,00"],
           ["Criação de sites simples", "R$ 30,00"],
           ["Revisão de trabalhos", "R$ 10,00"],
           ["Resumos técnicos", "R$ 10,00"],
           ["Criação de artes e logotipos", "R$ 15,00"],
       ],
       larguras=[5.2, 2.9])
retangulo(s, 9.3, 2.85, 3.1, 2.6, RGBColor(0xEC, 0xF0, 0xFB), raio=True)
tf = caixa(s, 9.6, 3.12, 2.55, 2.1)
texto(tf, "INALTERADO", size=10, cor=SKILL, bold=True, fonte=TITULO, primeiro=True, espaco=8)
texto(tf, "Autenticação, integração Supabase, configurações da Vercel, pedidos comerciais e identidade visual aprovada.",
      size=10.5, cor=CHARCOAL, altura=1.3)
tf = caixa(s, 0.9, 5.7, 11.5, 0.8)
texto(tf, "Alterações pontuais e seguras: nada foi substituído, nenhuma funcionalidade foi removida sem necessidade.",
      size=11.5, cor=CHARCOAL, primeiro=True, altura=1.3)
rodape(s, 8)

# =====================================================================  09
s = slide()
trilho(s, kicker="Prioridades 2 e 3 · revisão", titulo="Apresentação e funcionalidades conferidas",
       sub="Página inicial, equipe, menus, cards, páginas internas, rodapé e versão para celular.")
blocos = [
    ("Revisão visual", ["Página inicial e seção da equipe", "Menu, cards e páginas internas", "Rodapé e versão mobile"]),
    ("Funcionalidades", ["Links, botões e navegação", "Login e área do aluno", "Áreas Design, Administração e TI"]),
]
for i, (tit, itens_b) in enumerate(blocos):
    x = 0.9 + i * 5.9
    retangulo(s, x, 2.95, 5.6, 2.5, WHITE, linha=RGBColor(0xDD, 0xE2, 0xF0), raio=True)
    tf = caixa(s, x + 0.4, 3.2, 4.8, 2.0)
    texto(tf, tit.upper(), size=11, cor=SKILL, bold=True, fonte=TITULO, primeiro=True, espaco=10)
    for it in itens_b:
        texto(tf, "—  " + it, size=11.5, cor=CHARCOAL, espaco=8, altura=1.2)
retangulo(s, 0.9, 5.7, 11.5, 0.95, RGBColor(0xEC, 0xF0, 0xFB), raio=True)
tf = caixa(s, 1.2, 5.92, 10.9, 0.6)
texto(tf, "Nenhuma alteração quebrou o que já funcionava: as rotas, o formulário, a área do aluno e o painel administrativo seguem respondendo.",
      size=11.5, cor=DEEP, primeiro=True, altura=1.3)
rodape(s, 9)

# =====================================================================  10
s = slide(DEEP)
trilho(s, kicker="Prioridade 4 · finalização", titulo="Executado de verdade, com resultado",
       cor_kicker=ACCENT, cor_titulo=WHITE)
dados = [
    ("76 / 76", "verificações automatizadas aprovadas", OK),
    ("0", "ocorrências de “Ethan”, “Emily” e “Marketing”", OK),
    ("3", "áreas oficiais consistentes no site", OK),
    ("0", "erros de build ou de checagem de tipos", OK),
]
for i, (num, rot, cor) in enumerate(dados):
    x = 0.9 + i * 2.95
    retangulo(s, x, 2.2, 2.68, 1.95, RGBColor(0x18, 0x27, 0x50), raio=True)
    tf = caixa(s, x + 0.3, 2.5, 2.1, 1.4)
    texto(tf, num, size=30, cor=cor, bold=True, fonte=TITULO, primeiro=True, espaco=5)
    texto(tf, rot, size=10, cor=RGBColor(0xB8, 0xC2, 0xDE), altura=1.25, espaco=0)
tf = caixa(s, 0.9, 4.5, 11.5, 1.5)
texto(tf, "Build de produção: concluído sem erro.", size=13, cor=WHITE, bold=True,
      fonte=TITULO, primeiro=True, espaco=8)
texto(tf, "A checagem varre a página inicial, as rotas, o formulário, a área do aluno, o painel, as ferramentas, a central de ajuda, a acessibilidade e a abertura animada.",
      size=11, cor=RGBColor(0xB8, 0xC2, 0xDE), altura=1.3)
rodape(s, 10, escuro=True)

# =====================================================================  11
s = slide()
trilho(s, kicker="Transparência final", titulo="O que ainda depende de ação externa",
       sub="Declarado como pendência real — nada aqui foi simulado como concluído.")
tabela(s, 0.9, 2.9, 11.5, 2.5,
       cols=["Item", "Situação real"],
       linhas=[
           ["Publicação na Vercel", ("Deploy automático do branch principal; verificação feita pelo build",)],
           ["Projeto Supabase ativo + provedor Google", "Depende de credenciais externas ao repositório"],
           ["Variáveis VITE_SUPABASE_* na Vercel", "Dependem de configuração no painel da Vercel"],
           ["Divulgação de nomes da equipe", "Aguardando autorização da equipe"],
       ],
       larguras=[4.6, 6.9])
tf = caixa(s, 0.9, 5.75, 11.5, 0.9)
texto(tf, "Sem essas configurações, login, banco e painel aparecem no site como pendência declarada — o produto nunca simula um envio que não aconteceu.",
      size=11.5, cor=CHARCOAL, primeiro=True, altura=1.3)
rodape(s, 11)

# =====================================================================  12
s = slide(DEEP)
retangulo(s, 0, 0, 13.333, 0.12, SKILL)
logo(s, "logo-white.png", 0.95, 0.8, 2.2)
tf = caixa(s, 0.95, 2.6, 10.8, 2.6)
texto(tf, "REGRA FINAL", size=12, cor=ACCENT, bold=True, fonte=TITULO, primeiro=True, espaco=16)
texto(tf, "Não inventar nada.\nNão alterar a estrutura da empresa.\nNão criar nomes nem quantidades.",
      size=30, cor=WHITE, bold=True, fonte=TITULO, espaco=0, altura=1.16)
retangulo(s, 0.95, 5.6, 1.7, 0.05, SKILL)
tf = caixa(s, 0.95, 5.9, 10.5, 0.9)
texto(tf, "O projeto foi corrigido, não reinventado. Toda informação publicada agora tem origem nos documentos da equipe.",
      size=13, cor=RGBColor(0xB8, 0xC2, 0xDE), primeiro=True, altura=1.35)
tf = caixa(s, 0.95, 6.75, 6, 0.3)
texto(tf, "Skill Craft · Projeto Integrador 2026", size=9.5,
      cor=RGBColor(0x8A, 0x97, 0xBC), primeiro=True)

SAIDA.parent.mkdir(parents=True, exist_ok=True)
prs.save(SAIDA)
print(f"OK — {SAIDA.relative_to(RAIZ)} ({len(prs.slides.__iter__.__self__._sldIdLst)} slides)")
