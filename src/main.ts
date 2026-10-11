import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createHead())

app.mount('#app')
