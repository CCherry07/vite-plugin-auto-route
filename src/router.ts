import { createRouter, createWebHistory } from 'vue-router'
const About = () => import('./About.vue')
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./Home.vue'),
    },
    { path: '/about', component: About },
    {
      path: '/user',
      component: () => import('./User.vue'),
    }
  ],
})


export default router
