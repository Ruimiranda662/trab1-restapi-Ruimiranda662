require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const alunosRouter = require('./routes/alunos');

const app = express();
const PORT = process.env.PORT || 10000; // Porta padrão do Render

// Configuração avançada do CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://seu-frontend.vercel.app' // Substitua pelo seu domínio Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/alunos', alunosRouter);

// Health Check (obrigatório para o Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

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
  w: 'majority'
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  
  // Inicia o servidor
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Conexões encerradas');
        process.exit(0);
      });
    });
  });
})
.catch(err => {
  console.error('❌ Falha na conexão com MongoDB:', err);
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
    requestId: req.id
  });
});

// Rota para 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    availableEndpoints: {
      GET: ['/', '/health', '/api/alunos'],
      POST: ['/api/alunos']
    }
  });
});