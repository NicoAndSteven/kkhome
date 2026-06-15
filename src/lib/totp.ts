/**
 * TOTP (Time-based One-Time Password) 验证
 * 兼容 Google Authenticator / Authy / Microsoft Authenticator
 * 使用 Web Crypto API (SubtleCrypto)，无外部依赖
 */

const TOTP_INTERVAL = 30 // 每 30 秒刷新
const TOTP_DIGITS = 6 // 6 位数字

// Base32 解码（TOTP secret 通常用 Base32 编码）
function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const bytes: number[] = []
  let buffer = 0
  let bitsLeft = 0

  for (const char of cleaned) {
    const val = alphabet.indexOf(char)
    if (val < 0) continue
    buffer = (buffer << 5) | val
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 0xff)
      bitsLeft -= 8
    }
  }

  return new Uint8Array(bytes)
}

// HMAC-SHA1 签名
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' },
    false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message.buffer as ArrayBuffer)
  return new Uint8Array(signature)
}

/**
 * 生成 TOTP 验证码
 * @param secretBase32 Base32 编码的密钥
 * @param timestamp 时间戳（毫秒），默认当前时间
 * @returns 6 位验证码
 */
export async function generateTOTP(secretBase32: string, timestamp = Date.now()): Promise<string> {
  const key = base32Decode(secretBase32)
  let counter = Math.floor(timestamp / 1000 / TOTP_INTERVAL)

  // 将 counter 转为 8 字节大端序
  const msg = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    msg[i] = counter & 0xff
    counter >>= 8
  }

  const hash = await hmacSha1(key, msg)

  // 动态截取
  const offset = hash[hash.length - 1] & 0xf
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const otp = binary % Math.pow(10, TOTP_DIGITS)
  return otp.toString().padStart(TOTP_DIGITS, '0')
}

/**
 * 验证 TOTP 验证码（允许前后各一个时间窗口的偏移）
 * @param secretBase32 Base32 密钥
 * @param code 用户输入的 6 位验证码
 * @returns 是否有效
 */
export async function verifyTOTP(secretBase32: string, code: string): Promise<boolean> {
  const now = Date.now()
  // 检查当前、前 30 秒、后 30 秒（容差 1 个窗口）
  for (let offset = -1; offset <= 1; offset++) {
    const generated = await generateTOTP(secretBase32, now + offset * TOTP_INTERVAL * 1000)
    if (generated === code) return true
  }
  return false
}

/**
 * 生成 TOTP 密钥（Base32 编码，随机 20 字节 = 160 位）
 */
export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  let secret = ''
  for (const b of bytes) {
    secret += chars[b % 32]
  }
  // 每 4 个字符加一个空格方便阅读
  return secret.match(/.{1,4}/g)?.join(' ') || secret
}

/**
 * 生成 otpauth URI（可生成 QR 码让用户扫描）
 */
export function generateOTPAuthURI(secret: string, account = 'kkhome', issuer = 'KKHome'): string {
  const cleanSecret = secret.replace(/\s/g, '')
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&digits=${TOTP_DIGITS}&period=${TOTP_INTERVAL}`
}
