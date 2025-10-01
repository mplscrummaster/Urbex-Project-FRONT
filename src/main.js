import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUsersStore } from '@/stores/users'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Hydrate user from existing token if present
const usersStore = useUsersStore()
usersStore.hydrate()

app.mount('#app')
