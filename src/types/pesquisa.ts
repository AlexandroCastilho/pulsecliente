export type TipoPergunta = 'TEXTO_LIVRE' | 'MULTIPLA_ESCOLHA' | 'ESCALA_NPS' | 'ESTRELAS'

export interface PerguntaInput {
  id?: string
  titulo: string
  tipo: TipoPergunta
  opcoes?: string[] | any
  obrigatoria: boolean
  ordem: number
}

export interface PesquisaInput {
  titulo: string
  descricao?: string
  dataInicio?: string | Date
  dataFim?: string | Date
  perguntas: PerguntaInput[]
}
