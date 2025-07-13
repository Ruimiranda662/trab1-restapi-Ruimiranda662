require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelos
const Curso = mongoose.model('Curso', new mongoose.Schema({
  nomeDoCurso: String
}));

const Aluno = mongoose.model('Aluno', new mongoose.Schema({
  nome: String,
  apelido: String,
  curso: String,
  anoCurricular: Number
}));

// Rotas para Cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rotas para Alunos
app.get('/api/alunos', async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/alunos', async (req, res) => {
  const aluno = new Aluno({
    nome: req.body.nome,
    apelido: req.body.apelido,
    curso: req.body.curso,
    anoCurricular: req.body.anoCurricular
  });

  try {
    const novoAluno = await aluno.save();
    res.status(201).json(novoAluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/alunos/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(aluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/alunos/:id', async (req, res) => {
  try {
    await Aluno.findByIdAndDelete(req.params.id);
    res.json({ message: 'Aluno apagado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});