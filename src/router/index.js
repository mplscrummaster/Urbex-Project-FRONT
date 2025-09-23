import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import InscrireView from '@/views/InscrireView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
      {
      path: '/inscrire',
      name: 'inscrire',
      component: InscrireView,
    },
  ],
})

export default router
