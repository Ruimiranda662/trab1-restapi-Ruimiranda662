require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');
const cursosRouter = require('./routes/cursos'); // Novo import

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração do CORS (mantida igual)
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://seu-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares (mantidos)
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (mantido)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rota raíz (atualizada com docs dos cursos)
app.get('/', (req, res) => {
  res.json({
    status: 'API funcionando',
    message: 'Bem-vindo à API da Escola',
    documentation: {
      endpoints: {
        alunos: {
          GET: '/api/alunos',
          POST: '/api/alunos',
          PUT: '/api/alunos/:id',
          DELETE: '/api/alunos/:id'
        },
        cursos: { // Adicionado
          GET: '/api/cursos',
          POST: '/api/cursos'
        },
        health: '/health'
      }
    }
  });
});

// Health Check (mantido)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusCode = dbStatus === 1 ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === 1 ? 'healthy' : 'unhealthy',
    dbStatus: getDbStatusText(dbStatus),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rotas da API (adicionada rota de cursos)
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter); // Nova rota

// Conexão ao MongoDB (mantida)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  },
  retryWrites: true,
  w: 'majority',
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  criarCursosIniciais(); // Nova função para popular cursos (opcional)
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('🛑 Servidor encerrado');
        process.exit(0);
      });
    });
  });
})
.catch(err => {
  console.error('❌ Falha na conexão com MongoDB:', err);
  process.exit(1);
});

// Função para popular cursos iniciais (opcional)
async function criarCursosIniciais() {
  const Curso = require('./models/Curso');
  const cursosExistentes = await Curso.countDocuments();
  
  if (cursosExistentes === 0) {
    await Curso.insertMany([
      { nome: "Engenharia de Software", codigo: "ESOFT" },
      { nome: "Ciência da Computação", codigo: "CCOMP" }
    ]);
    console.log('📚 Cursos iniciais criados!');
  }
}

// Tratamento de erros e 404 (mantidos)
app.use((err, req, res, next) => {
  console.error('🔥 Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Helper do MongoDB (mantido)
function getDbStatusText(statusCode) {
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return statusMap[statusCode] || 'unknown';
}