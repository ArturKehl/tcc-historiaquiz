require("dotenv").config();
const bcrypt=require("bcryptjs");
const {sequelize,User,ClassRoom,Question,Quiz,Achievement}=require("./models");

const questions = [
["Qual acontecimento marcou o início da Revolução Francesa?","Congresso de Viena","Queda da Bastilha","Revolução Industrial","Guerra dos Cem Anos","B","A Queda da Bastilha, em 14 de julho de 1789, tornou-se um dos principais símbolos da Revolução Francesa.","Revolução Francesa","FACIL"],
["Em que ano ocorreu a Independência do Brasil?","1789","1808","1822","1889","C","A Independência do Brasil foi proclamada em 7 de setembro de 1822.","História do Brasil","FACIL"],
["Qual foi uma consequência importante da Revolução Industrial?","Fim das cidades","Urbanização acelerada","Fim do comércio","Desaparecimento das fábricas","B","A industrialização estimulou a urbanização e transformou profundamente o trabalho e a produção.","Revolução Industrial","FACIL"],
["Qual civilização construiu grandes pirâmides em Gizé?","Romana","Egípcia","Grega","Persa","B","As pirâmides de Gizé foram construídas no Egito Antigo e estão associadas aos faraós.","Antiguidade","FACIL"],
["Qual documento inglês de 1215 limitou o poder do rei?","Magna Carta","Bill of Rights","Código Napoleônico","Tratado de Tordesilhas","A","A Magna Carta de 1215 impôs limites ao poder do monarca inglês.","Idade Média","MEDIO"],
["Qual evento encerrou oficialmente a Segunda Guerra Mundial na Europa?","Queda de Roma","Rendição alemã","Revolução Russa","Tratado de Versalhes","B","A Alemanha assinou sua rendição em maio de 1945, encerrando a guerra na Europa.","Segunda Guerra Mundial","FACIL"],
["Quem foi coroado imperador francês em 1804?","Luís XIV","Napoleão Bonaparte","Carlos Magno","Robespierre","B","Napoleão Bonaparte coroou-se imperador dos franceses em 1804.","Idade Moderna","FACIL"],
["O que foi o Iluminismo?","Movimento intelectual que valorizou a razão","Sistema feudal","Império militar","Religião medieval","A","O Iluminismo valorizou razão, ciência, crítica e direitos individuais.","Idade Moderna","MEDIO"],
["Qual foi a principal atividade econômica do Brasil colonial no Nordeste no século XVII?","Café","Açúcar","Borracha","Ouro","B","A produção açucareira foi central na economia colonial, especialmente no Nordeste.","História do Brasil","FACIL"],
["Qual país invadiu a Polônia em 1939, dando início à Segunda Guerra Mundial na Europa?","Alemanha","Japão","Estados Unidos","Espanha","A","A invasão alemã da Polônia em setembro de 1939 desencadeou a guerra na Europa.","Segunda Guerra Mundial","MEDIO"],
["Qual era a principal relação de trabalho no sistema feudal?","Servidão","Assalariamento industrial","Escravidão fabril","Trabalho autônomo","A","A servidão era uma relação central entre camponeses e senhores no feudalismo europeu.","Idade Média","FACIL"],
["Qual cidade foi centro da democracia ateniense?","Esparta","Atenas","Roma","Cartago","B","Atenas desenvolveu instituições democráticas para cidadãos homens livres.","Antiguidade","FACIL"],
["Qual foi o lema associado à Revolução Francesa?","Paz e Terra","Liberdade, Igualdade e Fraternidade","Ordem e Progresso","Deus e Pátria","B","Liberdade, igualdade e fraternidade tornou-se um lema associado à Revolução Francesa.","Revolução Francesa","FACIL"],
["Quem proclamou a República no Brasil em 1889?","Deodoro da Fonseca","Dom Pedro II","Tiradentes","Getúlio Vargas","A","Marechal Deodoro da Fonseca liderou o movimento militar que derrubou a monarquia em 1889.","História do Brasil","MEDIO"],
["Qual invenção é diretamente associada à mecanização da indústria têxtil?","Máquina a vapor","Telégrafo","Rádio","Computador","A","A máquina a vapor e outras máquinas transformaram a produção industrial, inclusive a indústria têxtil.","Revolução Industrial","MEDIO"],
["Qual povo criou a democracia direta em uma de suas cidades-estado?","Gregos","Astecas","Fenícios","Visigodos","A","Atenas, uma cidade-estado grega, desenvolveu uma forma de democracia direta.","Antiguidade","MEDIO"],
["Qual foi a função principal dos castelos medievais?","Centros de defesa e poder","Fábricas","Universidades modernas","Portos comerciais","A","Castelos funcionavam como estruturas defensivas e centros de poder senhorial.","Idade Média","FACIL"],
["Qual tratado impôs duras condições à Alemanha após a Primeira Guerra Mundial?","Versalhes","Tordesilhas","Utrecht","Paris de 1763","A","O Tratado de Versalhes foi assinado em 1919 e estabeleceu condições para a Alemanha.","Idade Contemporânea","FACIL"],
["Qual crise econômica ocorreu em 1929 e teve grande impacto mundial?","Crise de 1929","Crise do petróleo de 1973","Crise de 2008","Crise de 1848","A","A quebra da Bolsa de Nova York em 1929 foi seguida por uma grande depressão econômica.","Idade Contemporânea","FACIL"],
["Quem foi uma liderança importante do movimento de independência da Índia?","Mahatma Gandhi","Júlio César","Lênin","Churchill","A","Gandhi tornou-se uma das principais lideranças do movimento de independência indiano.","Idade Contemporânea","MEDIO"],
["Qual foi o principal objetivo das Grandes Navegações europeias?","Expandir rotas comerciais","Acabar com o comércio","Evitar novas terras","Destruir cidades europeias","A","A busca por novas rotas comerciais e riquezas foi um dos principais motores das navegações.","Idade Moderna","FACIL"],
["O que foi o Renascimento?","Movimento cultural de renovação artística e intelectual","Uma guerra medieval","Uma epidemia","Um sistema econômico","A","O Renascimento promoveu transformações culturais e intelectuais na Europa entre os séculos XIV e XVI.","Idade Moderna","FACIL"],
["Qual evento marcou a queda do Império Romano do Ocidente em 476?","Deposição de Rômulo Augústulo","Queda de Constantinopla","Revolução Francesa","Invasão da Inglaterra","A","A deposição de Rômulo Augústulo em 476 é tradicionalmente usada como marco da queda do Império Romano do Ocidente.","Antiguidade","MEDIO"],
["Qual país lançou bombas atômicas contra Hiroshima e Nagasaki em 1945?","Estados Unidos","Alemanha","Itália","União Soviética","A","Os Estados Unidos lançaram bombas atômicas sobre Hiroshima e Nagasaki em agosto de 1945.","Segunda Guerra Mundial","FACIL"],
["Qual processo aboliu oficialmente a escravidão no Brasil?","Lei Áurea","Lei de Terras","Lei Eusébio de Queirós","Constituição de 1824","A","A Lei Áurea, de 13 de maio de 1888, aboliu legalmente a escravidão no Brasil.","História do Brasil","FACIL"],
["Quem foi o primeiro imperador do Brasil?","Dom Pedro I","Dom Pedro II","Getúlio Vargas","Deodoro da Fonseca","A","Dom Pedro I declarou a Independência e foi o primeiro imperador do Brasil.","História do Brasil","FACIL"],
["Qual sistema econômico se consolidou com a Revolução Industrial?","Capitalismo industrial","Feudalismo","Mercantilismo medieval","Escambo","A","A industrialização contribuiu para a expansão do capitalismo industrial e do trabalho assalariado.","Revolução Industrial","MEDIO"],
["Qual cidade foi destruída pela erupção do Vesúvio em 79 d.C.?","Pompeia","Atenas","Alexandria","Esparta","A","Pompeia foi soterrada pela erupção do Vesúvio em 79 d.C.","Antiguidade","FACIL"],
["Qual acontecimento ficou conhecido como Dia D?","Desembarque aliado na Normandia","Ataque a Pearl Harbor","Queda de Berlim","Invasão da Polônia","A","O Dia D foi o desembarque aliado na Normandia em 6 de junho de 1944.","Segunda Guerra Mundial","MEDIO"],
["Qual foi uma característica do absolutismo europeu?","Concentração de poder monárquico","Fim das monarquias","Democracia direta universal","Fim dos exércitos","A","O absolutismo caracterizou-se pela forte concentração de poderes nas mãos dos monarcas.","Idade Moderna","MEDIO"]
];

async function main(){
  await sequelize.sync({force:true});
  const hash=await bcrypt.hash("123456",10);
  const professor=await User.create({nome:"Professor Carlos Oliveira",email:"professor@historiaquiz.com",senha:hash,tipo_usuario:"PROFESSOR"});
  const turmas=[];
  for(const nome of ["1º Ano A","2º Ano A","3º Ano A"]) turmas.push(await ClassRoom.create({nome,professor_id:professor.id}));
  for(let i=1;i<=10;i++){
    await User.create({nome:`Aluno ${i}`,email:`aluno${i}@historiaquiz.com`,senha:hash,tipo_usuario:"ALUNO",turma_id:turmas[(i-1)%3].id});
  }
  const qs=[];
  for(const q of questions) qs.push(await Question.create({
    enunciado:q[0],alternativa_a:q[1],alternativa_b:q[2],alternativa_c:q[3],alternativa_d:q[4],
    resposta_correta:q[5],explicacao:q[6],tema:q[7],dificuldade:q[8],professor_id:professor.id
  }));
  const quizDefs=[
    ["História do Brasil","Questões sobre Brasil colonial, Império e República","História do Brasil"],
    ["Segunda Guerra Mundial","Principais acontecimentos da Segunda Guerra","Segunda Guerra Mundial"],
    ["Revolução Francesa","Contexto e acontecimentos da Revolução Francesa","Revolução Francesa"],
    ["Antiguidade e Idade Média","Civilizações antigas e mundo medieval","Antiguidade"],
    ["Mundo Moderno","Renascimento, Iluminismo e transformações modernas","Idade Moderna"]
  ];
  for(const [titulo,descricao,tema] of quizDefs){
    const qz=await Quiz.create({titulo,descricao,tema,dificuldade:"MEDIO",professor_id:professor.id,status:"PUBLICADO"});
    const selected=qs.filter(q=>q.tema===tema);
    await qz.setPerguntas((selected.length?selected:qs.slice(0,6)).slice(0,6));
  }
  const ach=[
    ["Primeiro Passo","Realizar o primeiro quiz.","1 quiz","🚀"],
    ["Historiador","Acertar 50 perguntas.","50 acertos","📚"],
    ["Mestre da História","Acertar 100 perguntas.","100 acertos","👑"],
    ["Imbatível","Acertar 10 perguntas consecutivas.","10 em sequência","🔥"],
    ["Conhecimento Histórico","Completar quizzes de 5 temas diferentes.","5 quizzes","🌎"],
    ["Perfeito","Completar um quiz sem errar nenhuma questão.","100%","💯"],
    ["Primeiro Quiz","Concluir um quiz.","1 quiz","🎯"],
    ["50 Pontos","Conquistar seus primeiros pontos.","primeiros pontos","⭐"],
    ["1000 XP","Alcançar 1000 XP.","1000 XP","⚡"],
    ["Explorador","Completar 3 quizzes.","3 quizzes","🧭"]
  ];
  for(const a of ach) await Achievement.create({nome:a[0],descricao:a[1],requisito:a[2],icone:a[3]});
  console.log("Seed concluído.");
  console.log("Professor: professor@historiaquiz.com / 123456");
  console.log("Aluno: aluno1@historiaquiz.com / 123456");
  await sequelize.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
