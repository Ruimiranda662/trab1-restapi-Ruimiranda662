require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração avançada do CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://seu-frontend.vercel.app' // Substitua pelo seu URL real
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para log de requisições (útil para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rotas
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
        health: '/health'
      }
    }
  });
});

// Health Check aprimorado
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

// Rotas da API
app.use('/api/alunos', alunosRouter);

// Conexão ao MongoDB com configurações otimizadas
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
  
  // Inicia o servidor
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Acesse: http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM. Encerrando servidor...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('🛑 Conexões encerradas. Servidor offline.');
        process.exit(0);
      });
    });
  });
})
.catch(err => {
  console.error('❌ Falha crítica na conexão com MongoDB:', err);
  process.exit(1);
});

// Tratamento centralizado de erros
app.use((err, req, res, next) => {
  console.error('🔥 Erro não tratado:', {
    error: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    requestId: req.id,
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota para 404 (Endpoint não encontrado)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    availableEndpoints: {
      GET: ['/', '/health', '/api/alunos'],
      POST: ['/api/alunos'],
      PUT: ['/api/alunos/:id'],
      DELETE: ['/api/alunos/:id']
    }
  });
});

// Helper para status do MongoDB
function getDbStatusText(statusCode) {
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return statusMap[statusCode] || 'unknown';
}