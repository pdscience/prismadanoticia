import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Prisma da Notícia — Uma notícia. Vários ângulos.' },
  },
  {
    path: '/analise',
    name: 'analysis',
    component: () => import('@/views/AnalysisView.vue'),
    meta: { title: 'Análise — DNA da Notícia | Prisma' },
  },
  {
    path: '/vies',
    name: 'bias',
    component: () => import('@/views/BiasView.vue'),
    meta: { title: 'Radar de Enquadramento | Prisma' },
  },
  {
    path: '/comparacao',
    name: 'compare',
    component: () => import('@/views/CompareView.vue'),
    meta: { title: 'Comparação Inteligente | Prisma' },
  },
  {
    path: '/cobertura',
    name: 'coverage',
    component: () => import('@/views/CoverageView.vue'),
    meta: { title: 'Cobertura da História | Prisma' },
  },
  {
    path: '/blindspot',
    name: 'blindspot',
    component: () => import('@/views/BlindSpotView.vue'),
    meta: { title: 'BlindSpot Brasil | Prisma' },
  },
  {
    path: '/replay',
    name: 'replay',
    component: () => import('@/views/ReplayView.vue'),
    meta: { title: 'Prisma Replay | Prisma' },
  },
  {
    path: '/mapa',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { title: 'Mapa de Polarização em Tempo Real | Prisma' },
  },
  {
    path: '/tecnologia',
    name: 'tech',
    component: () => import('@/views/TechView.vue'),
    meta: { title: 'Prisma Engine — Tecnologia | Prisma' },
  },
  {
    path: '/marca',
    name: 'brand',
    component: () => import('@/views/BrandView.vue'),
    meta: { title: 'Brand Book | Prisma' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Ângulo não encontrado | Prisma' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 96 }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (typeof document !== 'undefined' && to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
