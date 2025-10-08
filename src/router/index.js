import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ListScenario from '@/views/ScenariosListView.vue'
import ExploreMap from '@/views/ExploreMapView.vue'
import CurrentMapView from '@/views/GameMapView.vue'
import ScenarioInfoView from '@/views/ScenarioDetailView.vue'
import Leaderboard from '@/views/LeaderboardView.vue'
import LeaderboardGlobal from '@/components/leaderboard/LeaderboardGlobal.vue'
import LeaderboardFriends from '@/components/leaderboard/LeaderboardFriends.vue'
import UserProfile from '@/views/UserProfile.vue'
import RegisterView from '@/views/RegisterView.vue'

// Simple auth check based on presence of token in localStorage
const isAuthenticated = () => !!localStorage.getItem('tokenUser')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: () => (isAuthenticated() ? { name: 'game-map' } : true),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/scenario',
      name: 'scenarios-list',
      component: ListScenario,
      meta: { requiresAuth: true },
    },

    // Legacy redirects
    { path: '/globalmap', redirect: '/explore-map' },
    { path: '/global-map', redirect: '/explore-map' },
    {
      path: '/explore-map',
      name: 'explore-map',
      component: ExploreMap,
      meta: { requiresAuth: true, keepAlive: true },
    },
    { path: '/currentmap', redirect: '/game-map' },
    { path: '/current-map', redirect: '/game-map' },
    {
      path: '/game-map',
      name: 'game-map',
      component: CurrentMapView,
      meta: { requiresAuth: true, keepAlive: true },
    },
    {
      path: '/scenario/:id',
      name: 'scenario-detail',
      component: ScenarioInfoView,
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: Leaderboard,
      meta: { requiresAuth: true },
      children: [
        { path: 'global', name: 'leaderboard-global', component: LeaderboardGlobal },
        { path: 'friends', name: 'leaderboard-friends', component: LeaderboardFriends },
        //Redirect pour ne pas tomber sur une page sans rien
        { path: '', redirect: { name: 'leaderboard-global' } },
      ],
    },
    { path: '/userProfile', redirect: '/user-profile' },
    {
      path: '/user-profile',
      name: 'user',
      component: UserProfile,
      meta: { requiresAuth: true },
    },
  ],
})

// Global navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.matched.some((r) => r.meta?.requiresAuth)) {
    if (!isAuthenticated()) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
