import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ListScenario from '@/views/Scenarios/ListScenario.vue'
import GlobalMap from '@/views/Maps/GlobalMap.vue'
import CurrentMission from '@/views/Maps/CurrentMap.vue'
import ScenarioInfo from '@/views/Scenarios/ScenarioInfo.vue'
import Leaderboard from '@/views/LeaderboardView.vue'
import LeaderboardGlobal from '@/components/LeaderBoard/LeaderboardGlobal.vue'
import LeaderboardFriends from '@/components/LeaderBoard/LeaderboardFriends.vue'
import LeaderboardWeek from '@/components/LeaderBoard/LeaderboardWeek.vue'
import UserProfile from '@/views/UserProfile.vue'
import RegisterView from '@/views/RegisterView.vue'

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
      path: '/register',
      name: 'register',
      component: RegisterView,
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
    {
      path: '/leaderboard',
      name: 'leader board',
      component: Leaderboard,
      children: [
        {
          path: '',
          component: LeaderboardGlobal,
        },
        {
          path: '/LeaderboardGlobal',
          name: 'global score',
          component: LeaderboardGlobal,
        },
        {
          path: '/LeaderboardWeeks',
          name: 'week score',
          component: LeaderboardWeek,
        },
        {
          path: '/LeaderboardFriends',
          name: 'friends score',
          component: LeaderboardFriends,
        },
      ],
    },
    {
      path: '/userProfile',
      name: 'user',
      component: UserProfile,
    },
  ],
})

export default router
