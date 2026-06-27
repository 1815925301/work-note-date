import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DayView from '@/views/DayView.vue'
import LoginView from '@/views/LoginView.vue'
import MonthView from '@/views/MonthView.vue'
import QuarterView from '@/views/QuarterView.vue'
import WeekView from '@/views/WeekView.vue'
import SearchView from '@/views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'home', component: HomeView },
    { path: '/day/:date', name: 'day', component: DayView, props: true },
    { path: '/week/:date', name: 'week', component: WeekView, props: true },
    {
      path: '/month/:year/:month',
      name: 'month',
      component: MonthView,
      props: (route) => ({
        year: Number(route.params.year),
        month: Number(route.params.month),
      }),
    },
    {
      path: '/quarter/:year/:q',
      name: 'quarter',
      component: QuarterView,
      props: (route) => ({
        year: Number(route.params.year),
        q: Number(route.params.q),
      }),
    },
    { path: '/search', name: 'search', component: SearchView },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) {
    await auth.checkStatus()
  }

  if (to.meta.public) {
    if (to.name === 'login' && auth.authenticated) {
      return '/'
    }
    return true
  }

  if (auth.authRequired && !auth.authenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
