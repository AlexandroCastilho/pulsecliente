export interface SmtpData {
  id: string
  host: string
  port: number
  user: string | null
  pass: string
  fromName: string | null
  fromEmail: string | null
}

export interface UserSettings {
  nome: string | null
  email: string
}

export interface EmpresaSettings {
  id: string
  nome: string
  logo: string | null
  plano: string
  assinaturaAtiva: boolean
  emailBrandColor: string | null
  emailLogoUrl: string | null
  emailHeaderText: string | null
}

export interface SettingsData {
  user: UserSettings
  empresa: EmpresaSettings
  smtp: SmtpData | null
}

export interface CheckoutData {
  url: string
}
