// ==========================================
// DATLIBRAS - ALFABETO E DATILOLOGIA
// ==========================================

const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const letrasTreinadas = ["A", "B", "C", "D"];

// Elementos da página
const grade = document.getElementById("alfabeto");
const letraAtual = document.getElementById("letraAtual");
const imagem = document.getElementById("imagemReferencia");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusCamera = document.getElementById("statusCamera");
const btnIniciar = document.getElementById("btnIniciarCamera");
const btnParar = document.getElementById("btnPararCamera");
const btnCapturar = document.getElementById("btnCapturar");
const btnExportar = document.getElementById("btnExportar");
const selectLetra = document.getElementById("letraSelecionada");
const mensagem = document.getElementById("mensagemColeta");
const placeholder = document.getElementById("cameraPlaceholder");

// Estado do aplicativo
let letraSelecionada = "A";
let camera = null;
let hands = null;
let ultimaCaptura = null;
let modeloIA = null;
let tentativaIA = null;
const amostras = [];

// 1. SELEÇÃO DAS LETRAS
function reiniciarTentativa() {
    tentativaIA = null;
}

function selecionarLetra(letra) {
    letraSelecionada = letra;
    letraAtual.textContent = letra;
    reiniciarTentativa();

    imagem.onerror = () => {
        imagem.style.display = "none";
    };
    imagem.style.display = "block";
    imagem.src = `img/alfabeto/${letra}.png`;
    imagem.alt = `Referência da letra ${letra}`;

    document.querySelectorAll(".letter-btn").forEach(botao => {
        botao.classList.toggle("active", botao.textContent === letra);
    });

    if (selectLetra && Array.from(selectLetra.options).some(opcao => opcao.value === letra)) {
        selectLetra.value = letra;
    }
}

letras.forEach(letra => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "letter-btn";
    botao.textContent = letra;
    botao.addEventListener("click", () => selecionarLetra(letra));
    grade.appendChild(botao);
});

selectLetra?.addEventListener("change", () => {
    selecionarLetra(selectLetra.value);
});

// 2. CARREGAMENTO DO MODELO TREINADO
fetch("data/modelo_letras.json")
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error("Modelo não encontrado.");
        }
        return resposta.json();
    })
    .then(dados => {
        modeloIA = dados;
        console.log("Modelo DatLibras carregado!");
    })
    .catch(erro => console.error("Erro ao carregar modelo:", erro));

// 3. NORMALIZAÇÃO E RECONHECIMENTO KNN
function normalizarIA(mao) {
    const pontos = mao.map(p => [1 - p.x, p.y, p.z]);
    const origem = pontos[0];

    const relativos = pontos.map(p =>
        p.map((valor, i) => valor - origem[i])
    );

    const escala = Math.max(
        ...relativos.map(p => Math.hypot(...p))
    );

    if (escala === 0) return null;

    return relativos.flat().map(v => v / escala);
}

function reconhecerIA(mao) {
    if (!modeloIA || mao.length !== 21) return null;

    const entrada = normalizarIA(mao);
    if (!entrada) return null;

    const vizinhos = modeloIA.amostras.map((amostra, i) => ({
        letra: modeloIA.rotulos[i],
        distancia: Math.hypot(
            ...amostra.map((v, j) => v - entrada[j])
        )
    }));

    vizinhos.sort((a, b) => a.distancia - b.distancia);

    const votos = {};
    vizinhos.slice(0, modeloIA.k).forEach(v => {
        votos[v.letra] = (votos[v.letra] || 0) + 1;
    });

    const ranking = Object.entries(votos)
        .sort((a, b) => b[1] - a[1]);

    return ranking[0]?.[0] ?? null;
}

// 4. FEEDBACK EM ÁUDIO
function falarIA(texto) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "pt-BR";
    voz.rate = 1;
    voz.pitch = 1;
    voz.volume = 1;

    window.speechSynthesis.speak(voz);
}

// 5. REGISTRO DE PONTOS NO SUPABASE
async function registrarAcerto(letra) {
    try {
        if (typeof supabaseClient === "undefined") {
            return "Correto! Banco de dados indisponível.";
        }

        const { data: sessao, error: erroSessao } =
            await supabaseClient.auth.getSession();

        if (erroSessao) {
            return "Correto! Erro ao verificar sessão.";
        }

        if (!sessao.session) {
            return "Correto! Entre na sua conta para ganhar pontos.";
        }

        const { data, error } = await supabaseClient.rpc(
            "registrar_progresso",
            { p_letra: letra }
        );

        if (error) {
            console.error("Erro ao registrar pontos:", error);
            return "Correto! Não foi possível salvar os pontos.";
        }

        if (data === true) {
            return "Correto! Você ganhou 10 pontos!";
        }

        return "Correto! Letra já concluída, sem novos pontos.";
    } catch (erro) {
        console.error(erro);
        return "Correto! Erro de conexão.";
    }
}

// 6. CORREÇÃO AUTOMÁTICA
function corrigirGesto(mao) {
    if (!modeloIA) {
        reiniciarTentativa();
        statusCamera.textContent = "Modelo indisponível";
        return;
    }

    if (!letrasTreinadas.includes(letraSelecionada)) {
        reiniciarTentativa();
        statusCamera.textContent = "Esta letra ainda está em desenvolvimento";
        return;
    }

    const letra = reconhecerIA(mao);

    if (!letra) {
        reiniciarTentativa();
        statusCamera.textContent = "Gesto não reconhecido";
        return;
    }

    const agora = performance.now();

    if (!tentativaIA ||
        tentativaIA.letra !== letra ||
        tentativaIA.alvo !== letraSelecionada ||
        agora - tentativaIA.ultimoQuadro > 750) {
        tentativaIA = {
            letra: letra,
            alvo: letraSelecionada,
            inicio: agora,
            ultimoQuadro: agora,
            quadros: 0,
            respondido: false,
            mensagem: ""
        };
    }

    tentativaIA.ultimoQuadro = agora;
    tentativaIA.quadros++;

    // Aguarda 1,2 segundo e pelo menos cinco quadros estáveis.
    if (agora - tentativaIA.inicio < 1200 || tentativaIA.quadros < 5) {
        statusCamera.textContent = "Letra estimada: " + letra;
        return;
    }

    const tentativa = tentativaIA;

    if (!tentativa.respondido) {
        tentativa.respondido = true;

        if (letra === "OUTRO") {
            tentativa.mensagem = "Gesto não reconhecido";
            falarIA("Gesto não reconhecido. Tente novamente.");
        } else if (letra === letraSelecionada) {
            tentativa.mensagem = "Correto! Registrando progresso...";
            falarIA("Muito bem! Você acertou!");

            registrarAcerto(letra).then(resultado => {
                tentativa.mensagem = resultado;
                if (tentativaIA === tentativa && camera) {
                    statusCamera.textContent = resultado;
                }
            });
        } else {
            tentativa.mensagem = "Tente novamente! Letra estimada: " + letra;
            falarIA("Tente novamente.");
        }
    }

    statusCamera.textContent = tentativa.mensagem;
}

// 7. DETECÇÃO E DESENHO DA MÃO
function onResults(results) {
    if (!camera) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(results.image, 0, 0, w, h);

    const mao = results.multiHandLandmarks?.[0];
    ultimaCaptura = mao || null;

    if (mao) {
        drawConnectors(ctx, mao, HAND_CONNECTIONS, {
            color: "#B99AEF", lineWidth: 4
        });
        drawLandmarks(ctx, mao, {
            color: "#4F20C9", lineWidth: 2, radius: 4
        });

        if (btnCapturar) btnCapturar.disabled = false;
        statusCamera.textContent = "Mão detectada";
    } else {
        if (btnCapturar) btnCapturar.disabled = true;
        statusCamera.textContent = "Aguardando mão";
    }

    ctx.restore();

    if (mao) {
        corrigirGesto(mao);
    } else {
        reiniciarTentativa();
    }
}

// 8. CONTROLE DA CÂMERA
async function iniciar() {
    if (camera) return;

    if (!navigator.mediaDevices?.getUserMedia) {
        return alert("Seu navegador não permite acesso à câmera. Use localhost ou HTTPS.");
    }

    btnIniciar.disabled = true;
    reiniciarTentativa();

    try {
        if (typeof Hands === "undefined" || typeof Camera === "undefined") {
            throw new Error("Não foi possível carregar o MediaPipe. Confira sua conexão com a internet.");
        }

        hands = new Hands({
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });
        hands.onResults(onResults);

        camera = new Camera(video, {
            onFrame: async () => {
                if (camera && hands) await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });

        await camera.start();
        video.style.display = "block";
        placeholder.style.display = "none";
        btnParar.disabled = false;
        statusCamera.textContent = "Câmera ativa";
    } catch (erro) {
        await parar();
        statusCamera.textContent = "Erro na câmera";
        alert("Não foi possível iniciar a câmera: " + erro.message);
    }
}

async function parar() {
    const cameraAtual = camera;
    const handsAtual = hands;
    camera = null;
    hands = null;
    reiniciarTentativa();

    btnIniciar.disabled = true;
    btnParar.disabled = true;
    if (btnCapturar) btnCapturar.disabled = true;

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    try {
        if (cameraAtual) await cameraAtual.stop();
    } catch (erro) {
        console.error("Erro ao parar câmera:", erro);
    } finally {
        if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }

    try {
        if (handsAtual) await handsAtual.close();
    } catch (erro) {
        console.error("Erro ao encerrar MediaPipe:", erro);
    }

    video.style.display = "none";
    placeholder.style.display = "block";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ultimaCaptura = null;
    btnIniciar.disabled = false;
    statusCamera.textContent = "Câmera desligada";
}

btnIniciar.addEventListener("click", iniciar);
btnParar.addEventListener("click", parar);

// 9. COLETA E EXPORTAÇÃO DE AMOSTRAS (LOCAL)
btnCapturar?.addEventListener("click", () => {
    if (!ultimaCaptura || !selectLetra) return;

    const pontos = ultimaCaptura.map(p => ({
        x: Number(p.x.toFixed(6)),
        y: Number(p.y.toFixed(6)),
        z: Number(p.z.toFixed(6))
    }));

    amostras.push({
        letra: selectLetra.value,
        pontos: pontos,
        dataColeta: new Date().toISOString()
    });

    if (mensagem) {
        mensagem.textContent = `${amostras.length} amostra(s) coletada(s). Última letra: ${selectLetra.value}.`;
    }
});

btnExportar?.addEventListener("click", () => {
    if (!amostras.length) {
        return alert("Colete pelo menos uma amostra antes de exportar.");
    }

    const blob = new Blob([JSON.stringify({
        projeto: "DatLibras",
        versao: 1,
        amostras: amostras
    }, null, 2)], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset-datLibras.json";
    a.click();
    URL.revokeObjectURL(url);
});

// 10. INICIALIZAÇÃO
selecionarLetra("A");

window.addEventListener("beforeunload", () => {
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
