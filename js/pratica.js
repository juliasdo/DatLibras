
const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let perguntaAtual = 0;
let pontuacao = 0;
let letrasSorteadas = [];
let respostaCorreta = "";
let respondeu = false;

const imagemSinal = document.getElementById("imagemSinal");
const imagemErro = document.getElementById("imagemErro");
const opcoes = document.getElementById("opcoes");
const pergunta = document.querySelector(".quiz-question");
const feedback = document.getElementById("feedback");
const proxima = document.getElementById("proxima");
const quizCount = document.getElementById("quizCount");
const quizProgress = document.getElementById("quizProgress");
const pontuacaoElemento = document.getElementById("pontuacao");

// Embaralha uma lista
function embaralhar(lista) {
    return [...lista].sort(() => Math.random() - 0.5);
}

// Inicia uma nova pergunta
function novaPergunta() {

    if (perguntaAtual >= alfabeto.length) {
        finalizarQuiz();
        return;
    }

    respondeu = false;

    feedback.textContent = "";
    feedback.className = "quiz-feedback";

    proxima.disabled = true;
    proxima.textContent = "Próxima pergunta";

    opcoes.innerHTML = "";

    pergunta.textContent = "Que letra é essa?";

    quizCount.textContent =
        `Pergunta ${perguntaAtual + 1} de ${alfabeto.length}`;

    quizProgress.style.width =
        `${(perguntaAtual / alfabeto.length) * 100}%`;

    // Sorteia uma letra que ainda não apareceu
    const letrasDisponiveis = alfabeto.filter(
        letra => !letrasSorteadas.includes(letra)
    );

    respostaCorreta = embaralhar(letrasDisponiveis)[0];

    letrasSorteadas.push(respostaCorreta);

    // Mostra a imagem da letra
    imagemSinal.hidden = false;
    imagemErro.hidden = true;

    imagemSinal.src = `img/alfabeto/${respostaCorreta}.png`;

    imagemSinal.onerror = function () {
        imagemSinal.hidden = true;
        imagemErro.hidden = false;
    };

    // Cria três alternativas incorretas
    const alternativasErradas = embaralhar(
        alfabeto.filter(letra => letra !== respostaCorreta)
    ).slice(0, 3);

    // Junta a resposta correta com as alternativas
    const alternativas = embaralhar([
        respostaCorreta,
        ...alternativasErradas
    ]);

    // Cria os botões
    alternativas.forEach(letra => {

        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "quiz-option";
        botao.textContent = letra;

        botao.addEventListener("click", () => {
            verificarResposta(letra, botao);
        });

        opcoes.appendChild(botao);
    });
}

// Verifica a resposta escolhida
function verificarResposta(letra, botaoSelecionado) {

    if (respondeu) return;

    respondeu = true;

    const botoes = document.querySelectorAll(".quiz-option");

    botoes.forEach(botao => {
        botao.disabled = true;

        if (botao.textContent === respostaCorreta) {
            botao.classList.add("correct");
        }
    });

    if (letra === respostaCorreta) {

        pontuacao++;

        feedback.textContent = "Muito bem! Você acertou! 💜";
        feedback.classList.add("correct-feedback");

    } else {

        botaoSelecionado.classList.add("incorrect");

        feedback.textContent =
            `Não foi dessa vez! A resposta correta era ${respostaCorreta}.`;

        feedback.classList.add("incorrect-feedback");
    }

    pontuacaoElemento.textContent = pontuacao;

    proxima.disabled = false;

    if (perguntaAtual === alfabeto.length - 1) {
        proxima.textContent = "Ver resultado";
    }
}

// Avança para a próxima pergunta
proxima.addEventListener("click", () => {

    if (!respondeu) return;

    perguntaAtual++;

    novaPergunta();
});

// Resultado final
function finalizarQuiz() {

    quizCount.textContent = "Desafio concluído!";

    pergunta.textContent = "Parabéns por praticar Libras! 🎉";

    imagemSinal.hidden = true;
    imagemErro.hidden = true;

    opcoes.innerHTML = "";

    feedback.textContent =
        `Você acertou ${pontuacao} de ${alfabeto.length} questões!`;

    feedback.className = "quiz-feedback correct-feedback";

    quizProgress.style.width = "100%";

    proxima.textContent = "Jogar novamente";
    proxima.disabled = false;

    proxima.onclick = () => {
        perguntaAtual = 0;
        pontuacao = 0;
        letrasSorteadas = [];

        pontuacaoElemento.textContent = "0";

        proxima.onclick = null;
        novaPergunta();
    };
}

// Começa o desafio
novaPergunta();
