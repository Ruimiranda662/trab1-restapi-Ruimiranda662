require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');

const app = express();
const PORT = process.env.PORT || 10000;  // Alterado para 10000 (porta padrão do Render)

// Middlewares
app.use(cors());
app.use(express.json());

// Rota raiz para teste
app.get('/', (req, res) => {
  res.send('API da Escola está funcionando! 🎉');
});

// Rotas de alunos
app.use('/api/alunos', alunosRouter);

// Health check (opcional, mas recomendado para o Render)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Conexão ao MongoDB + Iniciar servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas | Banco: escola');
    app.listen(PORT, '0.0.0.0', () => {  // '0.0.0.0' é crucial para o Render
      console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro na conexão:', err);
    process.exit(1);  // Encerra o processo se a conexão falhar
  });