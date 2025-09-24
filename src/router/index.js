import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import InscrireView from '@/views/InscrireView.vue'
import ListScenario from '@/views/ListScenario.vue'
import GlobalMap from '@/views/GlobalMap.vue'
import CurrentMission from '@/views/CurrentMission.vue'
import ScenarioInfo from '@/views/ScenarioInfo.vue'

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
    {
      path: '/scenario',
      name: 'scenario',
      component: ListScenario,
    },
    {
      path: '/globalmap',
      name: 'global map',
      component: GlobalMap,
    },
    {
      path: '/currentmission',
      name: 'current mission',
      component: CurrentMission,
    },
    {
      path: '/scenarioinfo',
      name: 'scenario info',
      component: ScenarioInfo,
    },
  ],
})

export default router
