<template>
  <div class="study-container">
    <h1>個別学習クイズ</h1>
    <p>クイズで挑戦したい項目を複数選択してください</p>
    <div class="options">
      <label v-for="(text, key) in categories" :key="key" class="option-label">
        <input type="checkbox" v-model="selectedCategories" :value="key">
        {{ text }}
      </label>
    </div>
    <button @click="startQuiz()" :disabled="selectedCategories.length === 0">クイズ開始</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const categories = {
  family: '科名',
  originPlant: '起源植物名',
  part: '部位',
  component: '成分',
  nature: '効能'
};

// 選択された項目を保存する配列
const selectedCategories = ref([]);

function startQuiz(category) {
  // 選択した項目をクエリパラメータとしてクイズ画面に渡す
  const categoriesString = selectedCategories.value.join(',');

  router.push({
    path: '/quiz',
    query: {
      count: 10, // 問題数は固定
      options: 4, // 選択肢も固定
      categories: categoriesString // 選択したクイズの項目
    }
  });
}
</script>

<style scoped>
/* スタイルは適宜追加 */
.option-label {
  display: block;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.option-label:hover {
  background-color: #f0f0f0;
}
input[type="checkbox"] {
  margin-right: 10px;
}
</style>