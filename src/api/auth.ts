const TOKEN_KEY = 'worknote_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function onAuthLogout(handler: () => void) {
  window.addEventListener('auth:logout', handler)
  return () => window.removeEventListener('auth:logout', handler)
}

export function emitAuthLogout() {
  setToken(null)
  window.dispatchEvent(new Event('auth:logout'))
}
