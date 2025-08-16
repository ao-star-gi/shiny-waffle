<template>
  <div class="exam-settings-container">
    <h1>国試風クイズ</h1>
    
    <div class="setting-group">
      <h3>問題数</h3>
      <select v-model="questionCount">
        <option v-for="n in [1, 5, 10, 20]" :key="n" :value="n">{{ n }}問</option>
      </select>
    </div>

    <button @click="startExam">クイズ開始</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const questionCount = ref(1); 
function startExam() {
  router.push({
    path: '/quiz',
    query: {
      count: questionCount.value,
      mode: 'exam' // 国試風モードであることを示す
    }
  });
}
</script>

<style scoped>
.exam-settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.setting-group {
  margin-bottom: 2rem;
}

select {
  padding: 0.5rem;
  border-radius: 8px;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>