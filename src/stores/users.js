import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { AuthAPI } from '@/services/api'

export const useUsersStore = defineStore('storeUsers', {
  state: () => ({
    user: null, // { id, username_user, mail_user, role_user }
    token: localStorage.getItem('auth_token') || null,
    loading: false,
    error: null,
    router: useRouter(), // NOTE: could be moved to composables later
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async loginUser(email, password) {
      this.error = null
      this.loading = true
      try {
        const result = await AuthAPI.login(email, password)
        // result shape: { token, id, username_user, mail_user, role_user }
        this.token = result.token
        localStorage.setItem('auth_token', result.token)
        this.user = {
          id: result.id,
          username_user: result.username_user,
          mail_user: result.mail_user,
          role_user: result.role_user,
        }
        // Redirect minimal (temp): adapt route name later
        this.router.replace('/currentmap')
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },
    async registrUser({ username, email, password }) {
      this.error = null
      this.loading = true
      try {
        const result = await AuthAPI.register(username, email, password)
        this.token = result.token
        localStorage.setItem('auth_token', result.token)
        this.user = {
          id: result.id,
          username_user: result.username_user,
          mail_user: result.mail_user,
          role_user: result.role_user,
        }
        this.router.replace('/currentmap')
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      this.router.replace('/login')
    },
    async hydrate() {
      // Optional: call on app start if token exists
      if (!this.token || this.user) return
      try {
        const me = await AuthAPI.me()
        this.user = me
      } catch {
        // token invalid → purge
        this.logout()
      }
    },
  },
})
