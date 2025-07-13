require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');
const cursosRouter = require('./routes/cursos');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração CORS melhorada
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://trab1-restapi-ruimiranda662.onrender.com',
    'https://trab1-restapi-ruimiranda662-5w31.vercel.app/' // Adicione seu domínio do Vercel aqui
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota raiz com documentação básica da API
app.get('/', (req, res) => {
  res.json({
    message: "Bem-vindo à API de Gestão de Alunos",
    version: "1.0.0",
    documentation: {
      endpoints: {
        alunos: {
          getAll: "GET /api/alunos",
          create: "POST /api/alunos",
          update: "PUT /api/alunos/:id",
          delete: "DELETE /api/alunos/:id"
        },
        cursos: {
          getAll: "GET /api/cursos"
        }
      }
    },
    status: {
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      server: "running"
    }
  });
});

// Conexão com MongoDB + Carga inicial de cursos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Garante os cursos necessários
    const Curso = require('./models/Curso');
    const cursosNecessarios = [
      { nome: "Engenharia Informática", codigo: "EINF" },
      { nome: "Gestão", codigo: "GEST" },
      { nome: "Medicina", codigo: "MED" },
      { nome: "Engenharia Redes e Sistemas Computacionais", codigo: "ERSC" }
    ];
    
    for (const curso of cursosNecessarios) {
      await Curso.findOneAndUpdate(
        { codigo: curso.codigo },
        curso,
        { upsert: true, new: true }
      );
    }
    console.log('📚 Cursos verificados/criados');
  })
  .catch(err => console.error('❌ Erro de conexão:', err));

// Rotas da API
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter);

// Health Check melhorado
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  res.status(dbStatus === 'healthy' ? 200 : 503).json({
    status: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint não encontrado",
    suggestion: "Verifique a documentação em /"
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📄 Documentação disponível em http://localhost:${PORT}`);
});