import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import { onAuthLogout, setToken } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const ready = ref(false)
  const authRequired = ref(false)
  const authenticated = ref(false)

  async function checkStatus() {
    const status = await api.authStatus()
    authRequired.value = status.authRequired
    authenticated.value = status.authenticated
    ready.value = true
    return status
  }

  async function login(password: string) {
    const result = await api.login(password)
    if (result.token) {
      setToken(result.token)
    }
    authenticated.value = true
    authRequired.value = result.authRequired
  }

  function logout() {
    setToken(null)
    authenticated.value = false
  }

  onAuthLogout(() => {
    authenticated.value = false
  })

  return { ready, authRequired, authenticated, checkStatus, login, logout }
})
