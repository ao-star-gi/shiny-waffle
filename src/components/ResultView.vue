<template>
  <div class="result-container">
    <h1>クイズ終了！</h1>
    <p>あなたのスコア: <span class="score">{{ score }}</span> / {{ totalQuestions }}</p>
    <button @click="restartQuiz">もう一度プレイ</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const score = ref(0);
const totalQuestions = ref(10);

onMounted(() => {
  // URLからスコアと全問題数を取得
  if (route.query.score) {
    score.value = parseInt(route.query.score);
    totalQuestions.value = parseInt(route.query.total);
  }
});

function restartQuiz() {
  router.push('/');
}
</script>

<style scoped>
.result-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

button {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
}
</style>