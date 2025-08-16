<template>
  <div class="quiz-container" v-if="currentQuestion">
    <p class="question-count">問題 {{ currentQuestionNumber }} / {{ totalQuestions }}</p>
    <h2>{{ currentQuestion.questionText }}</h2>

    <div class="options-container">
      <button
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        @click="selectOption(option)"
        :disabled="answerSelected && quizMode === 'normal'"
        :class="{
          'correct': answerSelected && quizMode === 'normal' && option === currentQuestion.correctAnswer,
          'wrong': answerSelected && quizMode === 'normal' && option !== currentQuestion.correctAnswer && selectedOption === option,
          'selected': quizMode === 'exam' && selectedOptions.includes(option)
        }"
      >
        {{ option }}
      </button>
    </div>

    <div v-if="quizMode === 'exam' && selectedOptions && selectedOptions.length === 3 && !answerSelected" class="input-container">
      <div v-for="(option, index) in selectedOptions" :key="index" class="correction-group">
        <p class="wrong-statement">**誤**：{{ option }}</p>
        <input 
          type="text" 
          v-model="userAnswers[option]" 
          placeholder="正しい答えを入力"
          class="correction-input"
        />
      </div>
      <button @click="submitAnswers" class="submit-button">回答を提出</button>
    </div>

    <div v-if="answerSelected" class="feedback-container">
      <h3>あなたの回答</h3>
      
      <div v-if="quizMode === 'normal'">
        <p :class="{ 'correct': isCorrect, 'wrong': !isCorrect }">
          {{ selectedOption }}
        </p>
      </div>

      <div v-if="quizMode === 'exam'">
        <div v-for="(option, index) in currentQuestion.options" :key="index" class="answer-item">
          <p :class="{ correct: selectedOptions.includes(option) && currentQuestion.correctStatements.includes(option),
                      wrong: selectedOptions.includes(option) && currentQuestion.wrongStatements && currentQuestion.wrongStatements.includes(option) }">
            {{ option }}
            <span v-if="currentQuestion.wrongStatements && currentQuestion.wrongStatements.includes(option)">
              （**正**：{{ currentQuestion.corrections[option] }}）
            </span>
          </p>
        </div>
      </div>
      
      <p v-if="isCorrect" class="feedback-text correct">正解です！</p>
      <p v-else class="feedback-text wrong">不正解です...</p>
      <button @click="nextQuestion" class="next-button">次の問題へ</button>
    </div>
  </div>
  <div v-else>
    <p>クイズを読み込み中...</p>
  </div>
  <div v-if="quizFinished">
    <h2>クイズ終了！</h2>
    <p>{{ score }}問中{{ totalQuestions }}問正解しました！</p>
    <button @click="resetQuiz">もう一度やる</button>
    <button @click="backToHome">ホームに戻る</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { generateQuizQuestion, generateExamQuestion, checkAnswer } from '../logic/quizLogic.js';

const route = useRoute();
const router = useRouter();
const selectedOption = ref(null);
const currentQuestion = ref(null);
const score = ref(0);
const answerSelected = ref(false);
const isCorrect = ref(false);

const quizMode = ref('normal');
const quizCategories = ref([]);
const optionCount = ref(4);

// 複数選択と入力欄の変数
const selectedOptions = ref([]);
const userAnswers = ref({});
const currentQuestionNumber = ref(1);
const totalQuestions = ref(10);
const quizFinished = ref(false);
// ...
onMounted(() => {
  if (route.query.categories) quizCategories.value = route.query.categories.split(',');
  if (route.query.mode) quizMode.value = route.query.mode;
  if (route.query.count) totalQuestions.value = parseInt(route.query.count, 10);
  startQuiz();
});

function startQuiz() {
  if (quizMode.value === 'exam') {
    currentQuestion.value = generateExamQuestion();
  } else {
    if (quizCategories.value.length > 0) {
      const randomCategory = quizCategories.value[Math.floor(Math.random() * quizCategories.value.length)];
      currentQuestion.value = generateQuizQuestion(randomCategory, optionCount.value);
    } else {
      console.error('クイズのカテゴリが選択されていません。');
    }
  }
}


// ユーザーが回答を提出したときのロジック
function selectOption(option) {
  if (answerSelected.value) return;
  
  // 国試風クイズの場合
  if (quizMode.value === 'exam') {
    const index = selectedOptions.value.indexOf(option);
    if (index > -1) {
      // すでに選択済みなら削除
      selectedOptions.value.splice(index, 1);
    } else {
      // 未選択なら追加（最大3つまで）
      if (selectedOptions.value.length < 3) {
        selectedOptions.value.push(option);
      }
    }
  } else {
    // 通常クイズの場合
    selectedOption.value = option;
    answerSelected.value = true;
    const shoyakuName = currentQuestion.value.shoyakuName; // shoyakuNameプロパティは仮
    isCorrect.value = (option === currentQuestion.value.correctAnswer);
    if (isCorrect.value) {
      score.value++;
    }
  }
}

function submitAnswers() {
  if (quizMode.value === 'exam') {
    answerSelected.value = true;
    const correct = checkExamAnswers(); // 国試風の正誤判定関数を呼び出し
    isCorrect.value = correct;

    if (isCorrect.value) {
      score.value++;
    }
  }
}

// 国試風問題の正誤を判定するロジック
function checkExamAnswers() {
  // 選択肢が3つ選択されているか確認
  if (selectedOptions.value.length !== 3) {
    return false;
  }
  
  // ユーザーが選択した3つが、すべて誤りの記述であるかを確認
  const selectedAreWrong = selectedOptions.value.every(option => 
    currentQuestion.value.wrongStatements && currentQuestion.value.wrongStatements.includes(option)
  );
  if (!selectedAreWrong) {
    return false;
  }
  
  // 入力された答えが正しいかを確認
  let allInputsCorrect = true;
  for (const wrongStatement of selectedOptions.value) {
    // 大文字・小文字、全角・半角スペースを無視して比較
    const user = userAnswers.value[wrongStatement]?.trim().toLowerCase() || '';
    const correct = currentQuestion.value.corrections[wrongStatement]?.trim().toLowerCase() || '';
    if (user !== correct) {
      allInputsCorrect = false;
      break;
    }
  }
  return allInputsCorrect;
}

function nextQuestion() {
  if (currentQuestionNumber.value < totalQuestions.value) {
    currentQuestionNumber.value++;
  // 状態をリセット
    answerSelected.value = false;
    selectedOption.value = null;
    selectedOptions.value = [];
    isCorrect.value = false;
    startQuiz();
  } else {
    // 10問終了したら結果画面を表示
    quizFinished.value = true;
  }
}

function resetQuiz() {
  // クイズの状態をリセットして次の10問へ
  currentQuestionNumber.value = 1;
  score.value = 0;
  quizFinished.value = false;
  startQuiz();
}

function backToHome() {
  router.push('/');
}

</script>

<style scoped>
.quiz-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #34495e;
}

.question-count {
  font-weight: bold;
  color: #888;
}

.options-container {
  display: flex;
  flex-direction: column;
}

button {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #e0e0e0;
}

button.selected {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

button.correct {
  background-color: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

button.wrong {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-container {
  margin-top: 2rem;
}

.feedback-text {
  font-weight: bold;
  font-size: 1.2rem;
}

.feedback-text.correct {
  color: #2ecc71;
}

.feedback-text.wrong {
  color: #e74c3c;
}

.next-button {
  background-color: #3498db;
  color: white;
  border: none;
  width: auto;
  margin: 2rem auto 0;
  padding: 0.8rem 2rem;
}
</style>