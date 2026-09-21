require("dotenv").config();
const express=require("express");
const cors=require("cors");
const path=require("path");
const {sequelize}=require("./models");

const app=express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

app.use("/api/auth",require("./routes/auth"));
app.use("/api/aluno",require("./routes/student"));
app.use("/api/professor",require("./routes/teacher"));

app.use(express.static(path.join(__dirname,"../../frontend")));
app.get("*",(req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({erro:"Rota não encontrada."});
  res.sendFile(path.join(__dirname,"../../frontend/index.html"));
});

const port=process.env.PORT||3000;
sequelize.authenticate()
  .then(()=>app.listen(port,()=>console.log(`História Quiz rodando em http://localhost:${port}`)))
  .catch(err=>{console.error("Erro ao conectar no MySQL:",err.message);process.exit(1);});
