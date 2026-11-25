// ==========================================
// DATLIBRAS - AUTENTICACAO COM SUPABASE
// ==========================================


// Funcoes auxiliares

function campo(id) {
    return document.getElementById(id);
}

function mensagem(id, texto, erro = false) {
    const elemento = campo(id);

    if (elemento) {
        elemento.textContent = texto;
        elemento.style.color = erro ? "#dc3545" : "#198754";
    } else {
        alert(texto);
    }
}

function verificarConexao() {
    if (typeof supabaseClient === "undefined") {
        alert("Conexao com o Supabase indisponivel.");
        return false;
    }

    return true;
}


// ==========================================
// 1. LOGIN
// ==========================================

const loginForm = campo("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!verificarConexao()) return;

        const email = campo("email").value.trim().toLowerCase();
        const senha = campo("senha").value;

        mensagem("loginMensagem", "Entrando...");

        try {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: senha
            });

            if (error) {
                mensagem(
                    "loginMensagem",
                    "Nao foi possivel entrar. Confira seus dados e a confirmacao do e-mail.",
                    true
                );
                return;
            }

            location.href = "inicio.html";

        } catch (error) {
            mensagem("loginMensagem", "Erro de conexao.", true);
        }
    });
}


// ==========================================
// 2. CADASTRO
// ==========================================

const cadastroForm = campo("cadastroForm");

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!verificarConexao()) return;

        const nome = campo("nome").value.trim();
        const email = campo("cadEmail").value.trim().toLowerCase();
        const senha = campo("cadSenha").value;
        const confirmar = campo("confirmarSenha").value;

        if (!nome) {
            alert("Informe seu nome.");
            return;
        }

        if (senha.length < 8) {
            alert("Use uma senha com pelo menos 8 caracteres.");
            return;
        }

        if (senha !== confirmar) {
            alert("As senhas nao coincidem.");
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: senha,
                options: {
                    data: {
                        nome: nome
                    }
                }
            });

            if (error) {
                alert("Erro no cadastro: " + error.message);
                return;
            }

            if (data.session) {
                alert("Cadastro realizado com sucesso!");
                location.href = "inicio.html";
            } else {
                alert("Confira seu e-mail para confirmar o cadastro.");
                location.href = "login.html";
            }

        } catch (error) {
            alert("Erro de conexao.");
        }
    });
}


// ==========================================
// 3. IDENTIFICACAO DO USUARIO
// ==========================================

async function carregarUsuario() {

    if (typeof supabaseClient === "undefined") return;

    const { data, error } = await supabaseClient.auth.getUser();

    const usuario = error ? null : data.user;

    const nome = usuario
        ? usuario.user_metadata?.nome || "Aluno"
        : "Visitante";

    const email = usuario
        ? usuario.email
        : "Nenhuma sessao ativa";

    if (campo("nomeUsuario")) {
        campo("nomeUsuario").textContent = nome;
    }

    if (campo("saudacaoNome")) {
        campo("saudacaoNome").textContent = usuario
            ? nome.split(" ")[0]
            : "aprendiz";
    }

    if (campo("perfilNome")) {
        campo("perfilNome").textContent = nome;
    }

    if (campo("perfilEmail")) {
        campo("perfilEmail").textContent = email;
    }
}

carregarUsuario();


// ==========================================
// 4. SAIR DA CONTA
// ==========================================

const sair = campo("sair");

if (sair) {
    sair.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!verificarConexao()) return;

        const { error } = await supabaseClient.auth.signOut({
            scope: "local"
        });

        if (error) {
            alert("Nao foi possivel sair da conta.");
            return;
        }

        location.href = "index.html";
    });
}


// ==========================================
// 5. RECUPERACAO DE SENHA
// ==========================================

const recForm = campo("recuperacaoForm");

if (recForm) {
    recForm.addEventListener("submit", (e) => {
        e.preventDefault();

        mensagem(
            "recMensagem",
            "Recuperacao de senha em configuracao."
        );
    });
}


// ==========================================
// 6. LIMPEZA DOS DADOS DEMONSTRATIVOS
// ==========================================

const limpar = campo("limparDados");

if (limpar) {
    limpar.addEventListener("click", (e) => {
        e.preventDefault();

        if (confirm("Deseja apagar os antigos dados demonstrativos?")) {

            localStorage.removeItem("datlibras_usuarios");
            localStorage.removeItem("datlibras_usuario");

            alert("Dados demonstrativos apagados.");
        }
    });
}


// Opcao manter conectado - configuracao futura

if (campo("lembrar")) {
    campo("lembrar").disabled = true;
}