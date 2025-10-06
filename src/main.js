import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUsersStore } from '@/stores/users'
import '@/styles/theme.scss'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Hydrate user from existing token if present
const usersStore = useUsersStore()
usersStore.hydrate()

// Global 401 handler: when API helper emits 'api:unauthorized', logout and redirect
if (typeof window !== 'undefined') {
	window.addEventListener('api:unauthorized', () => {
		try { usersStore.logout() } catch { /* noop */ }
	})
}

app.mount('#app')

// Register service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	navigator.serviceWorker.register('/sw.js').catch(() => {
		// fail silently
	})
}
