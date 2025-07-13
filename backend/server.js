require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunos');
const cursosRouter = require('./routes/cursos');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://trab1-restapi-ruimiranda662.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

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

// Rotas
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});