require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota para alunos
app.use('/api/alunos', alunosRouter);

// Conectar ao MongoDB e iniciar o servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas | Banco: escola | Coleção: alunos');
    
    // 🚀 Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erro na conexão:', err));