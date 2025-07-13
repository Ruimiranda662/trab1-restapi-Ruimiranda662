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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 2. Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Logging de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
});

// 4. Rotas principais
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter);

// 5. Rota Health Check melhorada
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusCode = dbStatus === 1 ? 200 : 503;
  
  const healthCheck = {
    status: dbStatus === 1 ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: getDbStatusText(dbStatus),
    memoryUsage: process.memoryUsage(),
  };

  res.status(statusCode).json(healthCheck);
});

// 6. Conexão resiliente com MongoDB
const connectToDatabase = () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  };

  mongoose.connect(process.env.MONGODB_URI, options)
    .then(async () => {
      console.log('✅ Conectado ao MongoDB');
      await seedInitialData();
    })
    .catch(err => {
      console.error('❌ Falha na conexão com MongoDB:', err.message);
      console.log('⏳ Tentando reconexão em 5 segundos...');
      setTimeout(connectToDatabase, 5000);
    });
};

// 7. População inicial de dados
async function seedInitialData() {
  try {
    const Curso = require('./models/Curso');
    const cursosExistentes = await Curso.countDocuments();
    
    if (cursosExistentes === 0) {
      const cursosIniciais = [
        { nome: "Engenharia Informática", codigo: "EINF" },
        { nome: "Gestão", codigo: "GEST" },
        { nome: "Medicina", codigo: "MED" },
        { nome: "Engenharia Redes e Sistemas Computacionais", codigo: "ERSC" }
      ];
      
      await Curso.insertMany(cursosIniciais);
      console.log('📚 Cursos iniciais criados:', cursosIniciais.map(c => c.nome));
    }
  } catch (err) {
    console.error('Erro ao verificar dados iniciais:', err);
  }
}

// 8. Tratamento de erros centralizado
app.use((err, req, res, next) => {
  console.error('🔥 Erro:', {
    error: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    error: isProduction ? 'Erro interno do servidor' : err.message,
    details: isProduction ? undefined : {
      stack: err.stack,
      path: req.path,
      method: req.method
    },
    requestId: req.id
  });
});

// 9. Rota 404 aprimorada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    documentation: {
      alunos: {
        GET: '/api/alunos',
        POST: '/api/alunos',
        PUT: '/api/alunos/:id',
        DELETE: '/api/alunos/:id'
      },
      cursos: {
        GET: '/api/cursos',
        POST: '/api/cursos'
      },
      health: '/health'
    }
  });
});

// 10. Inicialização do servidor
connectToDatabase();

mongoose.connection.on('connected', () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('🔗 Endpoints disponíveis:');
    console.log(`- Alunos: http://localhost:${PORT}/api/alunos`);
    console.log(`- Cursos: http://localhost:${PORT}/api/cursos`);
    console.log(`- Health Check: http://localhost:${PORT}/health`);
  });
});

// 11. Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('🛑 Recebido sinal de desligamento. Encerrando servidor...');
  
  mongoose.connection.close(false)
    .then(() => {
      console.log('✅ Conexão com MongoDB fechada');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Erro ao fechar conexão com MongoDB:', err);
      process.exit(1);
    });
}

// Helper para status do MongoDB
function getDbStatusText(statusCode) {
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return statusMap[statusCode] || 'unknown';
}