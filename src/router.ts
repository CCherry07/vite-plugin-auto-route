import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./Home.vue'),
    },
    { path: '/home', component: () => import('./About.vue') },
  ],
})


export default router
