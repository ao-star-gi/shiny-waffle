import { shoyakuList } from '../data/shoyakuList.js';

/**
 * ランダムにシャッフルされた配列を返すヘルパー関数
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * クイズの問題を生成する関数
 * @param {string} category
 * @param {number} optionCount - 選択肢の数
 * @returns {object} 生成されたクイズ問題オブジェクト
 */
export function generateQuizQuestion(category, optionCount = 4) {
  // 全生薬リストをシャッフル
  const shuffledShoyaku = shuffleArray([...shoyakuList]);

  const correctAnswerShoyaku = shuffledShoyaku[0];
  const correctAnswer = correctAnswerShoyaku[category];
  const categoryMap = {
    family: '科名',
    originPlant: '起源植物名',
    part: '部位',
    component: '成分',
    nature: '効能'
  };
  const questionText = `${correctAnswerShoyaku.name}の${categoryMap[category]}は次のうちどれ？`;
  let options = [correctAnswer];
  

  // 誤った選択肢を生成
  while (options.length < optionCount) {
    const wrongAnswer = shuffledShoyaku.find(s => s[category] !== correctAnswer && !options.includes(s[category]));
    if (wrongAnswer) {
      options.push(wrongAnswer[category]);
    } else {
      break;
    }

  }

  // 選択肢をシャッフル
  const shuffledOptions = shuffleArray(options);

  return {
    questionText,
    options: shuffledOptions,
    correctAnswer
  };
}


/**
 * ヘルパー関数: 正しい記述文を生成
 */
function getCorrectStatement(shoyaku, property) {
  const propertyMap = {
    family: '科名',
    originPlant: '起源植物名',
    part: '部位',
    component: '主な成分',
    nature: '効能・用途'
  };
  const correctValue = shoyaku[property];
  return `${shoyaku.name}の${propertyMap[property]}は「${correctValue}」である。`;
}

/**
 * ヘルパー関数: 誤った記述文を生成
 */
function getIncorrectStatement(shoyaku, property, incorrectValue) {
  const propertyMap = {
    family: '科名',
    originPlant: '起源植物名',
    part: '部位',
    component: '主な成分',
    nature: '効能・用途'
  };
  return `${shoyaku.name}の${propertyMap[property]}は「${incorrectValue}」である。`;
}

/**
 * ヘルパー関数: 指定された生薬とプロパティの間違った値を生成
 */
function getIncorrectValue(shoyaku, property) {
  const allValuesForProperty = shoyakuList.map(s => s[property]);
  let incorrectValue;
  do {
    incorrectValue = allValuesForProperty[Math.floor(Math.random() * allValuesForProperty.length)];
  } while (incorrectValue === shoyaku[property]);
  return incorrectValue;
}

/**
 * 国試風の問題を生成する関数
 * @returns {object} 生成された国試風問題オブジェクト
 */
export function generateExamQuestion() {
  const shuffledShoyaku = shuffleArray([...shoyakuList]);
  const allProperties = ['family', 'originPlant', 'part', 'component', 'nature'];

  const allOptions = [];
  const wrongStatements = [];
  const corrections = {};

  // 誤りの記述を3つ作成
  while (wrongStatements.length < 3) {
    const shoyaku = shuffledShoyaku[wrongStatements.length];
    const property = allProperties[Math.floor(Math.random() * allProperties.length)];
    const incorrectValue = getIncorrectValue(shoyaku, property);
    const statement = getIncorrectStatement(shoyaku, property, incorrectValue);
    
    if (!wrongStatements.includes(statement)) {
      wrongStatements.push(statement);
      corrections[statement] = shoyaku[property];
    }
  }

  // 正しい記述を2つ作成
  const correctStatements = [];
  while (correctStatements.length < 2) {
    const shoyaku = shuffledShoyaku[3 + correctStatements.length];
    const property = allProperties[Math.floor(Math.random() * allProperties.length)];
    const statement = getCorrectStatement(shoyaku, property);
    
    if (!correctStatements.includes(statement) && !wrongStatements.includes(statement)) {
      correctStatements.push(statement);
    }
  }

  // 正解と誤りの記述を合わせて選択肢をシャッフル
  allOptions.push(...correctStatements, ...wrongStatements);
  shuffleArray(allOptions);

  return {
    questionText: `以下の記述のうち、**誤っているものを3つ**選び、それぞれ正しい答えを記述しなさい。`,
    options: allOptions,
    wrongStatements,
    correctStatements,
    corrections
  };
}
// localStorageから正解データを読み込む
function getLearningData() {
  const data = localStorage.getItem('shoyakuLearningData');
  return data ? JSON.parse(data) : {};
}

// localStorageに正解データを保存する
function saveLearningData(data) {
  localStorage.setItem('shoyakuLearningData', JSON.stringify(data));
}

// 回答が正しいか判定し、学習データを更新する関数
export function checkAnswer(selectedOption, correctAnswer, shoyakuName) {
  const isCorrect = selectedOption === correctAnswer;

  if (isCorrect) {
    const learningData = getLearningData();
    if (!learningData[shoyakuName]) {
      learningData[shoyakuName] = { correctCount: 0, totalCount: 0 };
    }
    learningData[shoyakuName].correctCount++;
    learningData[shoyakuName].totalCount++;
    saveLearningData(learningData);
  } else {
    // 不正解の場合も回数を記録
    const learningData = getLearningData();
    if (!learningData[shoyakuName]) {
      learningData[shoyakuName] = { correctCount: 0, totalCount: 0 };
    }
    learningData[shoyakuName].totalCount++;
    saveLearningData(learningData);
  }
  return isCorrect;
}