require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');
const cursosRouter = require('./routes/cursos');

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Configuração CORS Aprimorada
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://trab1-restapi-ruimiranda662.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// 2. Middlewares Essenciais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Adicione este middleware para log de requisições (útil para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 4. Rotas com tratamento de erro explícito
app.use('/api/alunos', (req, res, next) => {
  console.log('Acessando rota de alunos'); // Debug
  next();
}, alunosRouter);

app.use('/api/cursos', (req, res, next) => {
  console.log('Acessando rota de cursos'); // Debug
  next();
}, cursosRouter);

// 5. Rota Health Check (obrigatória para Render)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  res.status(dbStatus === 1 ? 200 : 503).json({
    status: dbStatus === 1 ? 'healthy' : 'unhealthy',
    database: dbStatus === 1 ? 'connected' : 'disconnected'
  });
});

// 6. Conexão ao MongoDB com timeout configurado
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // População inicial de cursos
    try {
      const Curso = require('./models/Curso');
      const count = await Curso.countDocuments();
      
      if (count === 0) {
        await Curso.insertMany([
          { nome: "Engenharia de Software", codigo: "ESOFT" },
          { nome: "Ciência da Computação", codigo: "CCOMP" }
        ]);
        console.log('📚 Cursos iniciais criados');
      }
    } catch (err) {
      console.error('Erro ao verificar cursos iniciais:', err);
    }
  })
  .catch(err => {
    console.error('❌ Falha na conexão com MongoDB:', err.message);
    setTimeout(connectWithRetry, 5000); // Tentativa de reconexão
  });
};

connectWithRetry();

// 7. Tratamento de erros aprimorado
app.use((err, req, res, next) => {
  console.error('🔥 Erro:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    requestId: req.id,
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 8. Rota 404 (Endpoint não encontrado)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    availableEndpoints: {
      alunos: '/api/alunos',
      cursos: '/api/cursos',
      health: '/health'
    }
  });
});

// 9. Inicia o servidor apenas após conexão com MongoDB
mongoose.connection.on('connected', () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('🔗 Endpoints disponíveis:');
    console.log(`- http://localhost:${PORT}/api/alunos`);
    console.log(`- http://localhost:${PORT}/api/cursos`);
    console.log(`- http://localhost:${PORT}/health`);
  });
});

// 10. Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM. Encerrando servidor...');
  mongoose.connection.close(false, () => {
    process.exit(0);
  });
});