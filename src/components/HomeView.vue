<template>
  <div class="home-container">
    <h1>生薬クイズ</h1>
    <p>クイズを始めよう</p>
    <div class="button-group">
      <button @click="startNormalQuiz">通常クイズ</button>
      <button @click="goToExamSettings">国試風クイズ</button>
    </div>

    <div class="chart-container">
      <h2>学習度合い</h2>
        <div v-if="chartData.datasets[0].data.length === 0"> 
         <p>クイズを解いて学習データを表示しよう！</p>
      </div>
      <DoughnutChart v-else :chartData="chartData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { shoyakuList } from '../data/shoyakuList.js';
import DoughnutChart from '../components/DoughnutChart.vue';

function getLearningData() {
  const data = localStorage.getItem('shoyakuLearningData');
  return data ? JSON.parse(data) : {};
}

const router = useRouter();
const chartData = ref({
  labels: ['未学習', 'うろ覚え', 'やや覚えた', '完璧に覚えた'],
  datasets: [{
    backgroundColor: ['#A9A9A9', '#FFD700', '#ADD8E6', '#90EE90'],
    data: []
  }]
});

onMounted(() => {
  updateChart();
});

function updateChart() {
  const learningData = getLearningData();
  const allShoyakuNames = shoyakuList.map(s => s.name);

  // カテゴリごとの生薬数を集計
  let categoryCounts = {
    unlearned: 0,
    unclear: 0,
    partiallyLearned: 0,
    mastered: 0
  };

  let totalQuizzedCount = 0;
  allShoyakuNames.forEach(shoyakuName => {
    const data = learningData[shoyakuName];
    if (data && data.totalCount > 0) {
      totalQuizzedCount++;
      const accuracy = data.correctCount / data.totalCount;
      if (accuracy >= 0 && accuracy <= 0.7) {
        categoryCounts.unclear++;
      } else if (accuracy > 0.7 && accuracy < 1) {
        categoryCounts.partiallyLearned++;
      } else if (accuracy === 1) {
        categoryCounts.mastered++;
      }
    } else {
      categoryCounts.unlearned++;
    }
  });

  // グラフデータを更新
  chartData.value.labels = ['未学習', 'うろ覚え', 'やや覚えた', '完璧に覚えた'];
  chartData.value.datasets[0].data = [
    categoryCounts.unlearned,
    categoryCounts.unclear,
    categoryCounts.partiallyLearned,
    categoryCounts.mastered
  ];
}

function startNormalQuiz() {
  router.push('/study');
}

function goToExamSettings() {
  router.push('/exam-settings');
}
</script>

<style scoped>
.home-container {
  text-align: center;
  padding: 2rem;
}
.button-group {
  margin-top: 2rem;
}
button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  cursor: pointer;
}

.chart-container {
  margin-top: 3rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  /* グラフコンテナの高さを固定する */
  height: 350px; /* 例として350pxを設定 */
  position: relative;
}
</style>