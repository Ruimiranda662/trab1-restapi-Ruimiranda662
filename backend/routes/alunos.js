const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// Middleware para log de requisições
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// GET /api/alunos - Listar todos com paginação
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const alunos = await Aluno.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Aluno.countDocuments();
    
    res.status(200).json({
      alunos,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/alunos/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno) {
      return res.status(404).json({ 
        error: 'Aluno não encontrado',
        suggestedActions: ['Verifique o ID', 'Liste todos alunos via GET /api/alunos']
      });
    }
    res.json(aluno);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'ID inválido' });
    }
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// POST /api/alunos - Criar novo aluno
router.post('/', async (req, res) => {
  try {
    // Validação básica
    if (!req.body.nome || !req.body.curso) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        requiredFields: ['nome', 'curso', 'anoCurricular']
      });
    }

    const aluno = new Aluno({
      nome: req.body.nome,
      apelido: req.body.apelido || '',
      curso: req.body.curso,
      anoCurricular: req.body.anoCurricular || 1
    });

    await aluno.save();
    res.status(201).json(aluno);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: err.errors 
      });
    }
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// PUT /api/alunos/:id - Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['nome', 'apelido', 'curso', 'anoCurricular'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ 
        error: 'Atualização inválida',
        allowedFields: allowedUpdates
      });
    }

    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json(aluno);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: err.errors 
      });
    }
    res.status(400).json({ error: 'Erro na atualização' });
  }
});

// DELETE /api/alunos/:id - Remover aluno
router.delete('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json({ 
      success: true,
      message: 'Aluno removido com sucesso',
      deletedId: aluno._id
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover aluno' });
  }
});

module.exports = router;