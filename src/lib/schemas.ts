import { z } from 'zod'

export const PesquisaSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  perguntas: z.array(z.object({
    titulo: z.string().min(1, "A pergunta não pode estar vazia"),
    tipo: z.enum(['TEXTO_LIVRE', 'MULTIPLA_ESCOLHA', 'ESCALA_NPS', 'ESTRELAS']),
    opcoes: z.array(z.string()).optional(),
    obrigatoria: z.boolean().default(true)
  })).min(1, "A pesquisa deve ter pelo menos uma pergunta")
})

export const MembroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
})

export const SmtpSchema = z.object({
  host: z.string().min(1, "Host é obrigatório"),
  port: z.number().int().positive(),
  user: z.string().min(1, "Usuário é obrigatório"),
  pass: z.string().min(1, "Senha é obrigatória"),
  fromName: z.string().min(1, "Nome do remetente é obrigatório"),
  fromEmail: z.string().email("E-mail do remetente inválido")
})
