import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// ---------------------------------
// ここにルーターの設定を記述する
// ---------------------------------

// 1. 各画面のコンポーネントをインポート
import HomeView from './components/HomeView.vue'
import QuizView from './components/QuizView.vue'
import ResultView from './components/ResultView.vue'
import StudyView from './components/StudyView.vue'
import ExamSettingsView from './components/ExamSettingsView.vue'


// 2. ルート（URLとコンポーネントの対応）を定義
const routes = [
  { path: '/', component: HomeView },
  { path: '/quiz', component: QuizView },
  { path: '/result', component: ResultView },
  { path: '/study', component: StudyView },
  { path: '/exam-settings', component: ExamSettingsView } 
]

// 3. ルーターを作成
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ---------------------------------

createApp(App)
  .use(router) // ルーターをアプリに追加
  .mount('#app')