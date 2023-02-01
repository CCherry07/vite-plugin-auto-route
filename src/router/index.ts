import { createRouter, createWebHistory } from 'vue-router'
const About = () => import('../pages/About.vue')
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../pages/Home.vue'),
    },
    { path: '/about', component: About },
    {
      path: '/user',
      component: () => import('../pages/view/User.vue'),
    }, , {
      path: '/Test',
      name: 'Test',
      component: () => import('../pages/Test.vue'),
      meta: {
        title: 'Test',
      }
    }]
})


export default router
