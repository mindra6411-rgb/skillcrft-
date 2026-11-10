import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AtSign,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Info,
  Loader2,
  Mail,
  MessageCircle,
  RotateCcw,
  SendHorizonal,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { CONTATO, MEIOS_CONTATO, SERVICOS, type MeioContato } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { enviarSolicitacao, type ResultadoEnvio } from '../../lib/solicitations'
import {
  validarContato,
  validarDescricao,
  validarMeio,
  validarNome,
  validarServico,
  type CampoFormulario,
} from '../../lib/validation'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

type ContactProps = { preSelecao: { id: string; nonce: number } | null }

type Formulario = {
  nome: string
  servico: string
  descricao: string
  meio: MeioContato | ''
  contato: string
}

const FORM_INICIAL: Formulario = { nome: '', servico: '', descricao: '', meio: '', contato: '' }

export function Contact({ preSelecao }: ContactProps) {
  const { usuario } = useAuth()
  const [form, setForm] = useState<Formulario>(FORM_INICIAL)
  const [erros, setErros] = useState<Partial<Record<CampoFormulario, string>>>({})
  const [tocados, setTocados] = useState<Partial<Record<CampoFormulario, boolean>>>({})
  const [status, setStatus] = useState<'ocioso' | 'enviando' | 'sucesso'>('ocioso')
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null)
  const refNome = useRef<HTMLInputElement>(null)
  const idBase = useId()

  useEffect(() => {
    if (!preSelecao) return
    setForm((f) => ({ ...f, servico: preSelecao.id }))
    setStatus('ocioso')
  }, [preSelecao])

  const validarCampo = (campo: CampoFormulario, valor: Formulario): string | null => {
    switch (campo) {
      case 'nome':
        return validarNome(valor.nome)
      case 'servico':
        return validarServico(valor.servico)
      case 'descricao':
        return validarDescricao(valor.descricao)
      case 'meio':
        return validarMeio(valor.meio)
      case 'contato':
        return validarContato(valor.contato, valor.meio)
    }
  }

  const aoMudar = (campo: CampoFormulario, valor: string) => {
    const proximo = { ...form, [campo]: campo === 'meio' ? (valor as MeioContato) : valor } as Formulario
    if (campo === 'meio') proximo.contato = ''
    setForm(proximo)
    if (tocados[campo]) setErros((e) => ({ ...e, [campo]: validarCampo(campo, proximo) ?? undefined }))
  }

  const aoSair = (campo: CampoFormulario) => {
    setTocados((t) => ({ ...t, [campo]: true }))
    setErros((e) => ({ ...e, [campo]: validarCampo(campo, form) ?? undefined }))
  }

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    const campos: CampoFormulario[] = ['nome', 'servico', 'descricao', 'meio', 'contato']
    const novosErros: Partial<Record<CampoFormulario, string>> = {}
    for (const campo of campos) {
      const erro = validarCampo(campo, form)
      if (erro) novosErros[campo] = erro
    }
    setTocados({ nome: true, servico: true, descricao: true, meio: true, contato: true })
    setErros(novosErros)
    if (Object.values(novosErros).some(Boolean)) {
      const primeiro = campos.find((c) => novosErros[c])
      document.getElementById(`${idBase}-${primeiro}`)?.focus()
      return
    }

    setStatus('enviando')
    const servico = SERVICOS.find((s) => s.id === form.servico)
    const envio = await enviarSolicitacao(
      {
        nome: form.nome.trim(),
        servicoId: form.servico,
        servicoTitulo: servico?.titulo ?? form.servico,
        descricao: form.descricao.trim(),
        meioContato: form.meio,
        contato: form.contato.trim(),
      },
      usuario?.id ?? null,
    )
    // pequena espera para o estado de carregamento ser perceptível
    await new Promise((r) => setTimeout(r, 450))
    setResultado(envio)
    setStatus('sucesso')
  }

  const reiniciar = () => {
    setForm(FORM_INICIAL)
    setErros({})
    setTocados({})
    setResultado(null)
    setStatus('ocioso')
    refNome.current?.focus()
  }

  const erroDe = (campo: CampoFormulario) => (tocados[campo] ? erros[campo] : undefined)
  const idErro = (campo: CampoFormulario) => `${idBase}-${campo}-erro`

  const canais = [
    CONTATO.email ? { icone: Mail, texto: CONTATO.email } : null,
    CONTATO.whatsapp ? { icone: MessageCircle, texto: `WhatsApp +${CONTATO.whatsapp}` } : null,
    CONTATO.instagram ? { icone: AtSign, texto: `@${CONTATO.instagram}` } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null)

  return (
    <section id="contato" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-14rem] left-1/2 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full bg-skill-500/12 blur-[130px]" />
      </div>

      <div className="container-site relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            alinhamento="esquerda"
            kicker="Contato"
            titulo={
              <>
                Solicite seu serviço <span className="text-gradient-skill">em minutos</span>
              </>
            }
            lead="Escolha o serviço, descreva o pedido e diga como prefere ser contatado. A equipe retorna com orçamento, prazos e condições — etapa 3 do nosso fluxo."
          />

          <Reveal delay={0.12} className="mt-8 space-y-4">
            {[
              { icone: Wallet, texto: 'Sem pagamento online: valores e combinados são fechados diretamente com a equipe.' },
              { icone: ShieldCheck, texto: 'Seus dados são usados apenas para retornar o contato sobre este pedido.' },
              {
                icone: Info,
                texto:
                  'Ambiente sem backend? O formulário valida tudo e salva um rascunho local declarado — nenhum envio falso é simulado.',
              },
            ].map((item) => (
              <p key={item.texto} className="flex items-start gap-3 font-body text-sm leading-relaxed text-offwhite-100/70">
                <item.icone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                {item.texto}
              </p>
            ))}
          </Reveal>

          {canais.length > 0 && (
            <Reveal delay={0.2} className="mt-8">
              <h3 className="kicker text-accent-400">Canais diretos</h3>
              <ul className="mt-3 space-y-2">
                {canais.map((canal) => (
                  <li key={canal.texto} className="flex items-center gap-2.5 font-body text-sm text-offwhite-100/75">
                    <canal.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {canal.texto}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="card-surface relative p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {status === 'sucesso' && resultado ? (
                <motion.div
                  key="sucesso"
                  role="status"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex min-h-96 flex-col justify-center text-center"
                >
                  <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-skill-500/15 text-accent-400">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-extrabold text-offwhite-50">
                    {resultado.status === 'enviado' ? 'Solicitação enviada!' : 'Solicitação registrada!'}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/75">
                    Protocolo <strong className="font-display text-accent-400">{resultado.solicitacao.protocolo}</strong> ·{' '}
                    {resultado.solicitacao.servicoTitulo}. A equipe retornará por{' '}
                    {MEIOS_CONTATO.find((m) => m.id === resultado.solicitacao.meioContato)?.label.toLowerCase() ??
                      resultado.solicitacao.meioContato}
                    .
                  </p>
                  {resultado.aviso && (
                    <p className="mx-auto mt-5 flex max-w-md items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-left font-caption text-xs leading-relaxed text-amber-200">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {resultado.aviso}
                    </p>
                  )}
                  <button type="button" onClick={reiniciar} className="btn-ghost mx-auto mt-7 !py-2.5">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Fazer nova solicitação
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="formulario"
                  onSubmit={aoEnviar}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor={`${idBase}-nome`} className="field-label">
                      Nome
                    </label>
                    <input
                      ref={refNome}
                      id={`${idBase}-nome`}
                      className={`field-input ${erroDe('nome') ? 'field-input-error' : ''}`}
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      value={form.nome}
                      onChange={(e) => aoMudar('nome', e.target.value)}
                      onBlur={() => aoSair('nome')}
                      aria-invalid={Boolean(erroDe('nome'))}
                      aria-describedby={erroDe('nome') ? idErro('nome') : undefined}
                    />
                    {erroDe('nome') && (
                      <p id={idErro('nome')} className="field-error" role="alert">
                        <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {erroDe('nome')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`${idBase}-servico`} className="field-label">
                      Serviço desejado
                    </label>
                    <div className="relative">
                      <select
                        id={`${idBase}-servico`}
                        className={`field-input appearance-none pr-10 ${erroDe('servico') ? 'field-input-error' : ''} ${
                          form.servico ? '' : 'text-offwhite-300/50'
                        }`}
                        value={form.servico}
                        onChange={(e) => aoMudar('servico', e.target.value)}
                        onBlur={() => aoSair('servico')}
                        aria-invalid={Boolean(erroDe('servico'))}
                        aria-describedby={erroDe('servico') ? idErro('servico') : undefined}
                      >
                        <option value="" disabled>
                          Escolha um serviço
                        </option>
                        {SERVICOS.map((s) => (
                          <option key={s.id} value={s.id} className="text-offwhite-50">
                            {s.titulo} — {s.precoLabel}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-offwhite-100/50"
                        aria-hidden="true"
                      />
                    </div>
                    {erroDe('servico') && (
                      <p id={idErro('servico')} className="field-error" role="alert">
                        <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {erroDe('servico')}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <label htmlFor={`${idBase}-descricao`} className="field-label">
                        Descrição do pedido
                      </label>
                      <span className="font-caption text-[0.65rem] text-offwhite-100/45">{form.descricao.length}/600</span>
                    </div>
                    <textarea
                      id={`${idBase}-descricao`}
                      rows={4}
                      maxLength={600}
                      className={`field-input resize-none ${erroDe('descricao') ? 'field-input-error' : ''}`}
                      placeholder="Curso, disciplina, prazo e o que você precisa entregar…"
                      value={form.descricao}
                      onChange={(e) => aoMudar('descricao', e.target.value)}
                      onBlur={() => aoSair('descricao')}
                      aria-invalid={Boolean(erroDe('descricao'))}
                      aria-describedby={erroDe('descricao') ? idErro('descricao') : undefined}
                    />
                    {erroDe('descricao') && (
                      <p id={idErro('descricao')} className="field-error" role="alert">
                        <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {erroDe('descricao')}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`${idBase}-meio`} className="field-label">
                        Meio de contato
                      </label>
                      <div className="relative">
                        <select
                          id={`${idBase}-meio`}
                          className={`field-input appearance-none pr-10 ${erroDe('meio') ? 'field-input-error' : ''} ${
                            form.meio ? '' : 'text-offwhite-300/50'
                          }`}
                          value={form.meio}
                          onChange={(e) => aoMudar('meio', e.target.value)}
                          onBlur={() => aoSair('meio')}
                          aria-invalid={Boolean(erroDe('meio'))}
                          aria-describedby={erroDe('meio') ? idErro('meio') : undefined}
                        >
                          <option value="" disabled>
                            Como retornamos?
                          </option>
                          {MEIOS_CONTATO.map((m) => (
                            <option key={m.id} value={m.id} className="text-offwhite-50">
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-offwhite-100/50"
                          aria-hidden="true"
                        />
                      </div>
                      {erroDe('meio') && (
                        <p id={idErro('meio')} className="field-error" role="alert">
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          {erroDe('meio')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`${idBase}-contato`} className="field-label">
                        {form.meio === 'email' ? 'Seu e-mail' : form.meio === 'whatsapp' ? 'Seu WhatsApp' : 'Seu telefone'}
                      </label>
                      <input
                        id={`${idBase}-contato`}
                        type={form.meio === 'email' ? 'email' : 'tel'}
                        inputMode={form.meio === 'email' ? 'email' : 'tel'}
                        autoComplete={form.meio === 'email' ? 'email' : 'tel'}
                        className={`field-input ${erroDe('contato') ? 'field-input-error' : ''}`}
                        placeholder={
                          form.meio === 'email' ? 'nome@dominio.com' : form.meio ? '11 98765-4321' : 'Escolha o meio ao lado'
                        }
                        disabled={!form.meio}
                        value={form.contato}
                        onChange={(e) => aoMudar('contato', e.target.value)}
                        onBlur={() => aoSair('contato')}
                        aria-invalid={Boolean(erroDe('contato'))}
                        aria-describedby={erroDe('contato') ? idErro('contato') : undefined}
                      />
                      {erroDe('contato') && (
                        <p id={idErro('contato')} className="field-error" role="alert">
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          {erroDe('contato')}
                        </p>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={status === 'enviando'}>
                    {status === 'enviando' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Registrando solicitação…
                      </>
                    ) : (
                      <>
                        <SendHorizonal className="h-4 w-4" aria-hidden="true" />
                        Solicitar atendimento
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
