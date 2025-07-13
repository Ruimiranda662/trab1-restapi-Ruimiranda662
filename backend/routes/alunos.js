const express = require('express');
const router = express.Router(); // Esta linha estava faltando
const Aluno = require('../models/Aluno');

// Rota POST para criar aluno
router.post('/', async (req, res) => {
  try {
    const { nome, apelido, curso, anoCurricular } = req.body;
    
    // Validação
    if (!nome || !apelido || !curso) {
      return res.status(400).json({ 
        success: false,
        message: 'Nome, apelido e curso são obrigatórios' 
      });
    }

    const aluno = new Aluno({ nome, apelido, curso, anoCurricular });
    await aluno.save();
    
    res.status(201).json({
      success: true,
      data: aluno
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aluno',
      error: err.message
    });
  }
});

// Adicione também as outras rotas (GET, PUT, DELETE)
router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.find().populate('curso');
    res.json({ success: true, data: alunos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;