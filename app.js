const questions = [
  {
    category: "html",
    question: "Qual tag cria um link em HTML?",
    answers: ["<a>", "<link>", "<href>", "<url>"],
    correct: 0
  },
  {
    category: "html",
    question: "Qual atributo melhora a acessibilidade de imagens?",
    answers: ["src", "alt", "target", "role-img"],
    correct: 1
  },
  {
    category: "css",
    question: "Qual propriedade muda a cor do texto?",
    answers: ["font-color", "text-style", "color", "paint"],
    correct: 2
  },
  {
    category: "css",
    question: "O que o Flexbox ajuda a resolver?",
    answers: ["Banco de dados", "Layout e alinhamento", "Autenticação", "Upload de arquivos"],
    correct: 1
  },
  {
    category: "js",
    question: "Qual método transforma uma lista em outra lista?",
    answers: ["map", "push", "split", "trim"],
    correct: 0
  },
  {
    category: "js",
    question: "Qual comando cria uma constante?",
    answers: ["var", "fixed", "const", "static"],
    correct: 2
  },
  {
    category: "js",
    question: "Qual API salva dados simples no navegador?",
    answers: ["localStorage", "fetch", "canvas", "history"],
    correct: 0
  },
  {
    category: "git",
    question: "Qual comando registra alterações no histórico?",
    answers: ["git save", "git commit", "git upload", "git snapshot"],
    correct: 1
  },
  {
    category: "git",
    question: "Qual comando envia commits para o GitHub?",
    answers: ["git send", "git push", "git export", "git ship"],
    correct: 1
  },
  {
    category: "css",
    question: "Qual unidade se adapta melhor ao tamanho da tela?",
    answers: ["px", "cm", "vw", "kg"],
    correct: 2
  },
  {
    category: "html",
    question: "Qual tag representa o conteúdo principal da página?",
    answers: ["<center>", "<main>", "<footer>", "<aside>"],
    correct: 1
  },
  {
    category: "js",
    question: "Qual palavra é usada para esperar uma Promise?",
    answers: ["hold", "wait", "await", "pause"],
    correct: 2
  }
];

const setup = document.querySelector("#setup");
const quiz = document.querySelector("#quiz");
const result = document.querySelector("#result");
const playerName = document.querySelector("#playerName");
const category = document.querySelector("#category");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const clearRankingBtn = document.querySelector("#clearRankingBtn");
const progress = document.querySelector("#progress");
const timer = document.querySelector("#timer");
const meterBar = document.querySelector("#meterBar");
const questionCategory = document.querySelector("#questionCategory");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const scoreTitle = document.querySelector("#scoreTitle");
const scoreText = document.querySelector("#scoreText");
const rankingList = document.querySelector("#rankingList");

const state = {
  player: "Visitante",
  pool: [],
  current: 0,
  score: 0,
  seconds: 15,
  intervalId: null,
  locked: false
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRanking() {
  return JSON.parse(localStorage.getItem("quiz-dev-ranking") || "[]");
}

function saveRanking(entry) {
  const ranking = getRanking()
    .concat(entry)
    .sort((a, b) => b.score - a.score || b.percent - a.percent)
    .slice(0, 8);

  localStorage.setItem("quiz-dev-ranking", JSON.stringify(ranking));
  renderRanking();
}

function renderRanking() {
  const ranking = getRanking();

  if (ranking.length === 0) {
    rankingList.innerHTML = "<li>Nenhum jogo ainda.</li>";
    return;
  }

  rankingList.innerHTML = ranking
    .map((item) => `<li><strong>${item.player}</strong> — ${item.score} pts (${item.percent}%)</li>`)
    .join("");
}

function startGame() {
  const selectedCategory = category.value;
  const filtered = selectedCategory === "all"
    ? questions
    : questions.filter((item) => item.category === selectedCategory);

  state.player = playerName.value.trim() || "Visitante";
  state.pool = shuffle(filtered).slice(0, 10);
  state.current = 0;
  state.score = 0;
  state.locked = false;

  setup.classList.add("hidden");
  result.classList.add("hidden");
  quiz.classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  state.locked = false;
  state.seconds = 15;
  clearInterval(state.intervalId);

  const item = state.pool[state.current];
  const percent = (state.current / state.pool.length) * 100;

  progress.textContent = `Pergunta ${state.current + 1}/${state.pool.length}`;
  meterBar.style.width = `${percent}%`;
  timer.textContent = `${state.seconds}s`;
  questionCategory.textContent = item.category.toUpperCase();
  questionText.textContent = item.question;
  answers.innerHTML = "";

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index));
    answers.appendChild(button);
  });

  state.intervalId = setInterval(() => {
    state.seconds -= 1;
    timer.textContent = `${state.seconds}s`;

    if (state.seconds <= 0) {
      chooseAnswer(-1);
    }
  }, 1000);
}

function chooseAnswer(index) {
  if (state.locked) return;

  state.locked = true;
  clearInterval(state.intervalId);

  const item = state.pool[state.current];
  const buttons = document.querySelectorAll(".answer");

  buttons.forEach((button, buttonIndex) => {
    if (buttonIndex === item.correct) button.classList.add("correct");
    if (buttonIndex === index && index !== item.correct) button.classList.add("wrong");
  });

  if (index === item.correct) {
    state.score += 10 + state.seconds;
  }

  setTimeout(() => {
    state.current += 1;

    if (state.current >= state.pool.length) {
      finishGame();
    } else {
      renderQuestion();
    }
  }, 900);
}

function finishGame() {
  const maxScore = state.pool.length * 25;
  const percent = Math.round((state.score / maxScore) * 100);

  quiz.classList.add("hidden");
  result.classList.remove("hidden");
  meterBar.style.width = "100%";

  scoreTitle.textContent = `${state.player}, você fez ${state.score} pontos`;
  scoreText.textContent = percent >= 70
    ? "Mandou bem! Seu perfil de dev está esquentando."
    : "Boa tentativa. Treino constante vira portfólio bonito.";

  saveRanking({
    player: state.player,
    score: state.score,
    percent
  });
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  result.classList.add("hidden");
  setup.classList.remove("hidden");
});
clearRankingBtn.addEventListener("click", () => {
  localStorage.removeItem("quiz-dev-ranking");
  renderRanking();
});

renderRanking();
