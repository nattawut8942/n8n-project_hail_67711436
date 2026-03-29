import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// ลบ import showdata จากตรงนี้ออกไปเลย

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/showdata',
    name: 'showdata',
    // ใช้รูปแบบ Lazy Load อย่างเดียว และเช็คตัวสะกดชื่อไฟล์ให้ตรง (Showdata.vue)
    component: () => import('../views/Showdata.vue')
  },
  {
    path: '/Product',
    name: 'Product',
    // ใช้รูปแบบ Lazy Load อย่างเดียว และเช็คตัวสะกดชื่อไฟล์ให้ตรง (Showdata.vue)
    component: () => import('../views/ProductView.vue')
  },
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router