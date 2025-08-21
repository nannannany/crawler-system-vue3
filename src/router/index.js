import { createRouter, createWebHistory } from 'vue-router'
import Index from "@/views/Index.vue";
import BaseSetting from "@/views/Settings/BaseSetting.vue";
import ResultList from "@/views/Results/ResultList.vue";
import MailSetting from "@/views/Settings/MailSetting.vue";
import Login from "@/views/Tools/Login.vue";

const routes = [
    { path: '/login', name: 'Login', component: Login },
    {
        path: '/',
        component: Index,
        children: [
            { path: '', redirect: '/BaseSetting' },
            { path: '/BaseSetting', name: 'BaseSetting', component: BaseSetting },
            { path: '/ResultList', name: 'ResultList', component: ResultList },
            { path: '/MailSetting', name: 'MailSetting', component: MailSetting },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const isLogin = !!localStorage.getItem("token")
    if (to.path !== "/login" && !isLogin) {
        next("/login")
    } else {
        next()
    }
})

export default router
