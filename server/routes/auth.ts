import { Router } from 'express'
import {
  createToken,
  isAuthEnabled,
  isRequestAuthenticated,
  verifyPassword,
} from '../auth.js'

export function createAuthRouter() {
  const router = Router()

  router.get('/status', (req, res) => {
    res.json({
      authRequired: isAuthEnabled(),
      authenticated: isRequestAuthenticated(req),
    })
  })

  router.post('/login', (req, res) => {
    if (!isAuthEnabled()) {
      res.json({ token: null, authRequired: false })
      return
    }

    const { password } = req.body as { password?: string }
    if (!password || !verifyPassword(password)) {
      res.status(401).json({ error: '密码错误' })
      return
    }

    res.json({ token: createToken(), authRequired: true })
  })

  return router
}
