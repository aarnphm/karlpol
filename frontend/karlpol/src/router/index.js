import VueRouter from "vue-router"
import Vue from "vue"

import SignUp from '@/components/SignUp'
import FrontPage from '@/components/FrontPage'
import HomePage from '@/components/HomePage'
import MapPage from '@/components/MapPage'

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
      {
        path: '/',
        name: 'FrontPage',
        component: FrontPage,
      },
      
      {
        path: '/SignUp',
        name: 'SignUp',
        component: SignUp,
      },
  
      {
        path: '/Homepage',
        name: 'Homepage',
        component: HomePage,
  
      },

      {
        path: '/MapPage',
        name: 'MapPage',
        component: MapPage,
  
      }
    ]
  })

export default router