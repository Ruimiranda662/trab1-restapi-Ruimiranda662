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

// Conexão à base de dados
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Ligado ao MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Servidor a correr em http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Erro na ligação à base de dados:', err));