DATALIBRAS — FRONTEND INICIAL
================================

1. Extraia a pasta DatLibras-frontend.
2. Abra a pasta no Visual Studio Code.
3. Execute o arquivo index.html usando a extensão Live Server.
4. Para testar a câmera, abra alfabetoedat.html pelo Live Server. A câmera exige localhost ou HTTPS e permissão do navegador.

ESTRUTURA
- index.html: página pública inicial
- login.html / cadastro.html / esqueci-senha.html: telas de acesso
- inicio.html: painel principal
- alfabetoedat.html: alfabeto, MediaPipe e coleta de landmarks
- comunicacao.html: cartões para conteúdo em vídeo
- pratica.html: quiz demonstrativo
- perfil.html: perfil demonstrativo
- css/: estilos
- js/: funcionalidades
- img/alfabeto/: imagens de referência A.png até Z.png

IMPORTANTE — LIMITAÇÕES DESTA VERSÃO
- O login e cadastro usam localStorage apenas para demonstração. Não são seguros e não substituem autenticação no servidor.
- Não use senhas reais neste protótipo.
- A recuperação de senha não envia e-mail.
- A câmera detecta landmarks da mão, mas ainda NÃO classifica a letra.
- A seção de Comunicação Essencial precisa receber vídeos de sinais validados.
- O alfabeto exige imagens de referência A.png, B.png ... Z.png dentro de img/alfabeto/.
- Não use desenhos decorativos como referência pedagógica de Libras. Valide os sinais com fontes confiáveis e pessoas fluentes/surdas.
- O projeto carrega Bootstrap, Google Fonts e MediaPipe por CDN; precisa de internet para esses recursos.

PRÓXIMAS ETAPAS
1. Conferir e ajustar os caminhos de imagens e logotipo.
2. Criar backend Flask e autenticação segura.
3. Criar banco PostgreSQL.
4. Desenvolver dataset e classificador de datilologia.
5. Integrar frontend, backend e modelo de reconhecimento.
