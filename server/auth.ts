import crypto from 'crypto'
import type { Request, Response, NextFunction } from 'express'

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function isAuthEnabled() {
  return Boolean(process.env.APP_PASSWORD?.trim())
}

function getSecret() {
  return process.env.APP_SECRET?.trim() || process.env.APP_PASSWORD?.trim() || ''
}

export function verifyPassword(password: string) {
  const expected = process.env.APP_PASSWORD ?? ''
  if (!expected) return false

  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function createToken() {
  const payload = { exp: Date.now() + TOKEN_TTL_MS }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string) {
  if (!isAuthEnabled()) return true

  const secret = getSecret()
  if (!secret) return false

  const [data, sig] = token.split('.')
  if (!data || !sig) return false

  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

function extractToken(req: Request) {
  const auth = req.headers.authorization
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAuthEnabled()) {
    next()
    return
  }

  const token = extractToken(req)
  if (token && verifyToken(token)) {
    next()
    return
  }

  res.status(401).json({ error: 'Unauthorized' })
}

export function isRequestAuthenticated(req: Request) {
  if (!isAuthEnabled()) return true
  const token = extractToken(req)
  return Boolean(token && verifyToken(token))
}
