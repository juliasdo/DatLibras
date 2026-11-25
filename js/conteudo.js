const sinais = [
 {nome:"Olá",grupo:"Cumprimentos",descricao:"Espaço para inserir vídeo validado do sinal."},
 {nome:"Bom dia",grupo:"Cumprimentos",descricao:"Espaço para inserir vídeo validado do sinal."},
 {nome:"Por favor",grupo:"Cortesia",descricao:"Espaço para inserir vídeo validado do sinal."},
 {nome:"Obrigado(a)",grupo:"Cortesia",descricao:"Espaço para inserir vídeo validado do sinal."},
 {nome:"Desculpa",grupo:"Cortesia",descricao:"Espaço para inserir vídeo validado do sinal."},
 {nome:"Tudo bem?",grupo:"Conversação",descricao:"Espaço para inserir vídeo validado do sinal."}
];
const lista=document.getElementById("listaSinais");
sinais.forEach(s=>{const col=document.createElement("div");col.className="col-md-6 col-lg-4";col.innerHTML=`<article class="module-card"><span class="eyebrow">${s.grupo}</span><div class="module-icon">🎥</div><h3>${s.nome}</h3><p>${s.descricao}</p><div class="video-placeholder">Vídeo de referência ainda não cadastrado</div></article>`;lista.appendChild(col);});