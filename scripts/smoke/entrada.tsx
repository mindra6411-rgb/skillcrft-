/**
 * Entrada do teste de fumaça (scripts/smoke.mjs).
 *
 * Empacota com esbuild o que o verificador precisa: o App real (sem mocks de
 * componentes), o módulo puro de rotas, os validadores do formulário e o
 * conteúdo oficial. Assim o teste exercita o código que vai para produção.
 */
import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../src/App'
import { lerRota, hashDaRota, ehHashDeAutenticacao, ehRotaConhecida } from '../../src/lib/rotas'
import {
  validarContato,
  validarDescricao,
  validarInformacoes,
  validarMeio,
  validarNome,
  validarPrazo,
  validarServico,
  gerarProtocolo,
  formatarData,
} from '../../src/lib/validation'
import { META_STATUS, STATUS_SOLICITACAO, rotuloStatus } from '../../src/lib/status'
import { AJUDA_FAQ, EQUIPE, NAV_LINKS, NAV_PAGINAS, SERVICOS } from '../../src/config/site'

export {
  App,
  createElement,
  act,
  createRoot,
  lerRota,
  hashDaRota,
  ehHashDeAutenticacao,
  ehRotaConhecida,
  validarContato,
  validarDescricao,
  validarInformacoes,
  validarMeio,
  validarNome,
  validarPrazo,
  validarServico,
  gerarProtocolo,
  formatarData,
  META_STATUS,
  STATUS_SOLICITACAO,
  rotuloStatus,
  AJUDA_FAQ,
  EQUIPE,
  NAV_LINKS,
  NAV_PAGINAS,
  SERVICOS,
}
