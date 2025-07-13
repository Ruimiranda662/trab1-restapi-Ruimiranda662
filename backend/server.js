require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rota raiz simplificada (remove a referência ao index.html)
app.get('/', (req, res) => {
  res.json({
    status: 'API funcionando',
    message: 'Bem-vindo à API da Escola',
    endpoints: {
      alunos: '/api/alunos',
      health: '/health'
    }
  });
});

// Rotas da API
app.use('/api/alunos', alunosRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Conexão ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Erro na conexão com MongoDB:', err);
  process.exit(1);
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});