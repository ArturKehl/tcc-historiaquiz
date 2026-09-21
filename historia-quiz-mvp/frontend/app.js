const app=document.getElementById("app");
const API="/api";
let token=localStorage.getItem("hq_token");
let user=JSON.parse(localStorage.getItem("hq_user")||"null");

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
async function api(path,opts={}){
  const res=await fetch(API+path,{headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opts.headers||{})},...opts});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.erro||"Erro na requisição");
  return data;
}
function saveLogin(data){token=data.token;user=data.usuario;localStorage.setItem("hq_token",token);localStorage.setItem("hq_user",JSON.stringify(user));}
function logout(){localStorage.clear();token=null;user=null;location.hash="#/login";}
function nav(){
 if(!user)return "";
 return `<header class="topbar"><nav class="nav"><div class="brand">📚 História Quiz</div><div class="navlinks">
 ${user.tipo_usuario==="ALUNO"?`
 <button class="btn" onclick="go('#/aluno')">Dashboard</button>
 <button class="btn" onclick="go('#/quizzes')">Quizzes</button>
 <button class="btn" onclick="go('#/ranking')">Ranking</button>
 <button class="btn" onclick="go('#/conquistas')">Conquistas</button>`:`
 <button class="btn" onclick="go('#/professor')">Dashboard</button>
 <button class="btn" onclick="go('#/questoes')">Questões</button>
 <button class="btn" onclick="go('#/quizzes-admin')">Quizzes</button>
 <button class="btn" onclick="go('#/alunos')">Alunos</button>`}
 <button class="btn danger" onclick="logout()">Sair</button></div></nav></header>`;
}
function layout(content){app.innerHTML=nav()+`<main class="container">${content}</main>`}
function go(h){location.hash=h}
function errorBox(e){return `<div class="alert">${esc(e.message)}</div>`}

async function loginPage(){
 app.innerHTML=`<main class="container login-wrap"><section class="card form">
 <div class="center"><div class="brand">📚 História Quiz</div><h1>Entrar</h1><p class="muted">Acesse sua área de aprendizagem.</p></div>
 <div id="msg"></div><form onsubmit="doLogin(event)">
 <div class="field"><label>E-mail</label><input id="email" type="email" required placeholder="voce@email.com"></div>
 <div class="field"><label>Senha</label><input id="senha" type="password" required></div>
 <button class="btn primary" style="width:100%">Entrar</button></form>
 <p class="center small"><a href="#/cadastro">Criar conta de aluno</a></p>
 <p class="center small muted">Demo: professor@historiaquiz.com / 123456<br>aluno1@historiaquiz.com / 123456</p>
 </section></main>`;
}
async function doLogin(e){
 e.preventDefault(); const msg=document.getElementById("msg");
 try{const d=await api("/auth/login",{method:"POST",body:JSON.stringify({email:email.value,senha:senha.value})});saveLogin(d);go(d.usuario.tipo_usuario==="PROFESSOR"?"#/professor":"#/aluno");}
 catch(x){msg.innerHTML=errorBox(x)}
}
async function registerPage(){
 app.innerHTML=`<main class="container login-wrap"><section class="card form">
 <h1>Crie sua conta</h1><div id="msg"></div><form onsubmit="doRegister(event)">
 <div class="field"><label>Nome</label><input id="nome" required></div>
 <div class="field"><label>E-mail</label><input id="email" type="email" required></div>
 <div class="field"><label>Senha</label><input id="senha" type="password" minlength="6" required></div>
 <div class="field"><label>Turma (opcional)</label><select id="turma"><option value="">Sem turma</option><option value="1">1º Ano A</option><option value="2">2º Ano A</option><option value="3">3º Ano A</option></select></div>
 <button class="btn primary" style="width:100%">Cadastrar</button></form>
 <p class="center"><a href="#/login">Já tenho conta</a></p></section></main>`;
}
async function doRegister(e){
 e.preventDefault();try{const d=await api("/auth/register",{method:"POST",body:JSON.stringify({nome:nome.value,email:email.value,senha:senha.value,turma_id:turma.value||null})});saveLogin(d);go("#/aluno")}catch(x){document.getElementById("msg").innerHTML=errorBox(x)}
}
async function studentDashboard(){
 try{const d=await api("/aluno/dashboard");const pct=d.nivel.proximo?Math.min(100,Math.round((d.xp/(d.nivel.proximo))*100)):100;
 layout(`<div class="title-row"><div><h2>Olá, ${esc(d.usuario.nome)} 👋</h2><span class="muted">${esc(d.usuario.turma)}</span></div></div>
 <div class="grid">
 <div class="card stat"><span class="muted">Pontuação</span><div class="num">${d.pontuacao}</div></div>
 <div class="card stat"><span class="muted">XP</span><div class="num">${d.xp}</div></div>
 <div class="card stat"><span class="muted">Quizzes</span><div class="num">${d.quizzes_realizados}</div></div>
 <div class="card stat"><span class="muted">Acertos</span><div class="num">${d.taxa_acerto}%</div></div></div>
 <div class="grid2" style="margin-top:18px"><section class="card"><h3>Nível ${d.nivel.numero} — ${esc(d.nivel.nome)}</h3><div class="progress"><div style="width:${pct}%"></div></div><p class="muted">${d.nivel.proximo?`${d.xp} / ${d.nivel.proximo} XP para o próximo nível`:"Nível máximo alcançado"}</p></section>
 <section class="card"><h3>Resumo</h3><p>📖 ${d.perguntas_respondidas} perguntas respondidas</p><p>🏆 ${d.conquistas} conquistas</p><p>🥇 Posição no ranking: ${d.posicao_ranking||"—"}</p></section></div>
 <div class="title-row"><h2>Comece a estudar</h2><button class="btn primary" onclick="go('#/quizzes')">Ver quizzes</button></div>`);
 }catch(e){layout(errorBox(e))}
}
async function quizzesPage(){
 try{const qs=await api("/aluno/quizzes");layout(`<div class="title-row"><h2>Quizzes de História</h2></div><div class="grid2">${qs.map(q=>`<div class="card quiz-card"><span class="badge">${esc(q.tema)}</span><h3>${esc(q.titulo)}</h3><p class="muted">${esc(q.descricao||"Teste seus conhecimentos.")}</p><div>${q.perguntas.length} perguntas · ${esc(q.dificuldade)}</div><button class="btn primary" onclick="go('#/quiz/${q.id}')">Começar quiz</button></div>`).join("")}</div>`)}
 catch(e){layout(errorBox(e))}
}
async function quizPage(id){
 try{const q=await api("/aluno/quizzes/"+id);layout(`<div class="title-row"><div><h2>${esc(q.titulo)}</h2><p class="muted">${esc(q.descricao||"")}</p></div></div><form id="quizForm" onsubmit="submitQuiz(event,${id})">${q.perguntas.map((p,i)=>`<div class="card question"><span class="badge">Questão ${i+1} · ${esc(p.dificuldade)}</span><h3>${esc(p.enunciado)}</h3>${["A","B","C","D"].map((l,j)=>`<label class="option"><input type="radio" name="q${p.id}" value="${l}" required> <b>${l})</b> ${esc(p["alternativa_"+l.toLowerCase()])}</label>`).join("")}</div>`).join("")}<button class="btn primary" type="submit">Finalizar quiz</button></form>`)}
 catch(e){layout(errorBox(e))}
}
async function submitQuiz(e,id){
 e.preventDefault();const respostas=[];document.querySelectorAll(".question").forEach(card=>{const inp=card.querySelector("input:checked");if(inp)respostas.push({pergunta_id:card.querySelector("input").name.substring(1),resposta:inp.value})});
 try{const r=await api("/aluno/quizzes/"+id+"/submit",{method:"POST",body:JSON.stringify({respostas})});layout(`<div class="card center"><div style="font-size:58px">${r.perfeito?"🏆":"🎉"}</div><h1>Quiz concluído!</h1><h2>+${r.pontos} pontos · +${r.xp} XP</h2><p>Você acertou <b>${r.acertos}</b> de ${r.acertos+r.erros} questões.</p><p>Melhor sequência: ${r.melhor_sequencia}</p><div style="text-align:left;margin-top:25px">${r.detalhes.map((d,i)=>`<div class="feedback ${d.correta?"ok":"bad"}"><b>${i+1}. ${d.correta?"Correto!":"Resposta incorreta"}</b><p>${esc(d.explicacao)}</p></div>`).join("")}</div><br><button class="btn primary" onclick="go('#/quizzes')">Voltar aos quizzes</button></div>`)}
 catch(x){layout(errorBox(x))}
}
async function rankingPage(){
 try{const rows=await api("/aluno/ranking");layout(`<div class="title-row"><h2>🏆 Ranking</h2></div><div class="card"><table class="table"><thead><tr><th>#</th><th>Aluno</th><th>Turma</th><th>Nível</th><th>Quizzes</th><th>Pontos</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.posicao}</td><td>${esc(r.nome)}</td><td>${esc(r.turma)}</td><td>${esc(r.nivel)}</td><td>${r.quizzes}</td><td><b>${r.pontos}</b></td></tr>`).join("")}</tbody></table></div>`)}
 catch(e){layout(errorBox(e))}
}
async function achievementsPage(){
 try{const rows=await api("/aluno/conquistas");layout(`<div class="title-row"><h2>🏅 Conquistas</h2></div><div class="grid2">${rows.map(a=>`<div class="card achievement ${a.desbloqueada?"":"locked"}"><div class="icon">${a.icone}</div><div><h3>${esc(a.nome)}</h3><p>${esc(a.descricao)}</p><span class="small muted">${a.desbloqueada?"Desbloqueada":"Ainda não desbloqueada"}</span></div></div>`).join("")}</div>`)}
 catch(e){layout(errorBox(e))}
}

async function teacherDashboard(){
 try{const d=await api("/professor/dashboard");layout(`<div class="title-row"><div><h2>Painel do Professor</h2><p class="muted">Olá, ${esc(user.nome)}.</p></div></div><div class="grid"><div class="card stat"><span class="muted">Alunos</span><div class="num">${d.alunos}</div></div><div class="card stat"><span class="muted">Quizzes</span><div class="num">${d.quizzes}</div></div><div class="card stat"><span class="muted">Média de acertos</span><div class="num">${d.media_acertos}%</div></div><div class="card stat"><span class="muted">Média de pontos</span><div class="num">${d.media_pontuacao}</div></div></div><div class="grid2" style="margin-top:18px"><div class="card"><h3>Gerenciamento</h3><div class="actions"><button class="btn primary" onclick="go('#/questoes')">Gerenciar questões</button><button class="btn" onclick="go('#/quizzes-admin')">Gerenciar quizzes</button></div></div><div class="card"><h3>Acompanhamento</h3><button class="btn primary" onclick="go('#/alunos')">Ver desempenho dos alunos</button></div></div>`) }catch(e){layout(errorBox(e))}
}
async function questionsPage(){
 try{const qs=await api("/professor/questoes");layout(`<div class="title-row"><h2>Questões</h2><button class="btn primary" onclick="questionModal()">+ Nova questão</button></div><div class="card"><table class="table"><thead><tr><th>ID</th><th>Questão</th><th>Tema</th><th>Dificuldade</th><th>Ações</th></tr></thead><tbody>${qs.map(q=>`<tr><td>${q.id}</td><td>${esc(q.enunciado).slice(0,70)}...</td><td>${esc(q.tema)}</td><td>${esc(q.dificuldade)}</td><td><button class="btn danger" onclick="deleteQuestion(${q.id})">Excluir</button></td></tr>`).join("")}</tbody></table></div>`)}
 catch(e){layout(errorBox(e))}
}
function questionModal(){
 app.insertAdjacentHTML("beforeend",`<div class="modal"><div class="card"><div class="title-row"><h2>Nova questão</h2><button class="btn" onclick="this.closest('.modal').remove()">Fechar</button></div><form onsubmit="createQuestion(event)"><div class="field"><label>Enunciado</label><textarea id="qe" required></textarea></div>${["a","b","c","d"].map(l=>`<div class="field"><label>Alternativa ${l.toUpperCase()}</label><input id="qa${l}" required></div>`).join("")}<div class="grid2"><div class="field"><label>Resposta correta</label><select id="qr"><option>A</option><option>B</option><option>C</option><option>D</option></select></div><div class="field"><label>Dificuldade</label><select id="qd"><option>FACIL</option><option selected>MEDIO</option><option>DIFICIL</option></select></div></div><div class="field"><label>Tema</label><input id="qt" required placeholder="História do Brasil"></div><div class="field"><label>Explicação educativa</label><textarea id="qx" required></textarea></div><button class="btn primary">Salvar questão</button></form></div></div>`);
}
async function createQuestion(e){
 e.preventDefault();try{await api("/professor/questoes",{method:"POST",body:JSON.stringify({enunciado:qe.value,alternativa_a:qaa.value,alternativa_b:qab.value,alternativa_c:qac.value,alternativa_d:qad.value,resposta_correta:qr.value,dificuldade:qd.value,tema:qt.value,explicacao:qx.value})});go("#/questoes")}catch(x){alert(x.message)}
}
async function deleteQuestion(id){if(!confirm("Excluir esta questão?"))return;try{await api("/professor/questoes/"+id,{method:"DELETE"});questionsPage()}catch(e){alert(e.message)}}
async function adminQuizzes(){
 try{const [qs,allq]=await Promise.all([api("/professor/quizzes"),api("/professor/questoes")]);layout(`<div class="title-row"><h2>Quizzes</h2><button class="btn primary" onclick='quizModal(${JSON.stringify(allq).replace(/'/g,"&#39;")})'>+ Novo quiz</button></div><div class="grid2">${qs.map(q=>`<div class="card"><span class="badge">${esc(q.status)}</span><h3>${esc(q.titulo)}</h3><p>${esc(q.descricao||"")}</p><p class="muted">${q.perguntas.length} perguntas · ${esc(q.tema)}</p><button class="btn danger" onclick="deleteQuiz(${q.id})">Excluir</button></div>`).join("")}</div>`) }catch(e){layout(errorBox(e))}
}
function quizModal(questions){
 app.insertAdjacentHTML("beforeend",`<div class="modal"><div class="card"><div class="title-row"><h2>Novo quiz</h2><button class="btn" onclick="this.closest('.modal').remove()">Fechar</button></div><form onsubmit="createQuiz(event)"><div class="field"><label>Título</label><input id="zt" required></div><div class="field"><label>Descrição</label><textarea id="zd"></textarea></div><div class="grid2"><div class="field"><label>Tema</label><input id="zm" required></div><div class="field"><label>Dificuldade</label><select id="zf"><option>FACIL</option><option selected>MEDIO</option><option>DIFICIL</option></select></div></div><div class="field"><label>Status</label><select id="zs"><option>PUBLICADO</option><option>RASCUNHO</option></select></div><div class="field"><label>Selecione perguntas</label>${questions.map(q=>`<label class="option"><input type="checkbox" name="qp" value="${q.id}"> ${esc(q.enunciado)}</label>`).join("")}</div><button class="btn primary">Criar quiz</button></form></div></div>`);
}
async function createQuiz(e){e.preventDefault();const perguntas=[...document.querySelectorAll('input[name="qp"]:checked')].map(x=>x.value);try{await api("/professor/quizzes",{method:"POST",body:JSON.stringify({titulo:zt.value,descricao:zd.value,tema:zm.value,dificuldade:zf.value,status:zs.value,perguntas})});go("#/quizzes-admin")}catch(x){alert(x.message)}}
async function deleteQuiz(id){if(!confirm("Excluir quiz?"))return;try{await api("/professor/quizzes/"+id,{method:"DELETE"});adminQuizzes()}catch(e){alert(e.message)}}
async function studentsPage(){
 try{const rows=await api("/professor/alunos");layout(`<div class="title-row"><h2>Desempenho dos alunos</h2></div><div class="card"><table class="table"><thead><tr><th>Aluno</th><th>Turma</th><th>Quizzes</th><th>Acertos</th><th>Taxa</th><th>Pontos</th><th>XP</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.nome)}</td><td>${esc(r.turma)}</td><td>${r.quizzes}</td><td>${r.acertos}</td><td>${r.taxa}%</td><td>${r.pontuacao}</td><td>${r.xp}</td></tr>`).join("")}</tbody></table></div>`) }catch(e){layout(errorBox(e))}
}

async function router(){
 const p=location.hash||"#/login";
 if(!user && !["#/login","#/cadastro"].includes(p)){go("#/login");return}
 if(p==="#/login")return loginPage();
 if(p==="#/cadastro")return registerPage();
 if(user.tipo_usuario==="ALUNO"){
  if(p==="#/aluno")return studentDashboard();
  if(p==="#/quizzes")return quizzesPage();
  if(p==="#/ranking")return rankingPage();
  if(p==="#/conquistas")return achievementsPage();
  if(p.startsWith("#/quiz/"))return quizPage(p.split("/")[2]);
  return studentDashboard();
 }
 if(user.tipo_usuario==="PROFESSOR"){
  if(p==="#/professor")return teacherDashboard();
  if(p==="#/questoes")return questionsPage();
  if(p==="#/quizzes-admin")return adminQuizzes();
  if(p==="#/alunos")return studentsPage();
  return teacherDashboard();
 }
}
window.addEventListener("hashchange",router);router();
