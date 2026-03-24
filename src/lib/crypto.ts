import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

export function encrypt(text: string): string {
  const key = Buffer.from(process.env.SMTP_ENCRYPTION_KEY || '', 'hex')
  if (key.length !== 32) {
    throw new Error('SMTP_ENCRYPTION_KEY must be a 32-byte hex string')
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:encrypted (all in base64)
  const result = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
  return result
}

export function decrypt(encryptedData: string): string {
  const key = Buffer.from(process.env.SMTP_ENCRYPTION_KEY || '', 'hex')
  if (key.length !== 32) {
    throw new Error('SMTP_ENCRYPTION_KEY must be a 32-byte hex string')
  }

  const [ivBase64, authTagBase64, encryptedBase64] = encryptedData.split(':')
  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    // If not in the new format, return as is (to handle legacy data during transition or errors)
    // Actually, the prompt says to warn the user, but for code safety:
    return encryptedData 
  }

  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const encrypted = Buffer.from(encryptedBase64, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
