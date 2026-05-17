import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/**styling */
// import './assets/main.css';
import './assets/tailwind.css' //tailwind

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
