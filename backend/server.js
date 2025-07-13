require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');
const cursosRouter = require('./routes/cursos');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração CORS atualizada
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://trab1-restapi-ruimiranda662.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rotas
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter);

// Conexão MongoDB com tratamento melhorado
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Conectado ao MongoDB');
  
  // Popula cursos iniciais se necessário
  const Curso = require('./models/Curso');
  if (await Curso.countDocuments() === 0) {
    await Curso.insertMany([
      { nome: "Engenharia de Software", codigo: "ESOFT" },
      { nome: "Ciência da Computação", codigo: "CCOMP" }
    ]);
    console.log('📚 Cursos iniciais criados');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Falha na conexão com MongoDB:', err);
  process.exit(1);
});

// Tratamento de erros centralizado
app.use((err, req, res, next) => {
  console.error('🔥 Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});