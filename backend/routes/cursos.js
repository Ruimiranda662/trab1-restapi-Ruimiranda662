const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// GET todos os cursos ativos
router.get('/', async (req, res) => {
  try {
    const cursos = await Curso.findAllActive();
    res.json({
      success: true,
      count: cursos.length,
      data: cursos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cursos',
      error: err.message
    });
  }
});

// POST criar novo curso
router.post('/', async (req, res) => {
  try {
    const { nome, codigo, descricao, duracaoAnos } = req.body;
    
    const novoCurso = new Curso({
      nome,
      codigo,
      descricao,
      duracaoAnos: duracaoAnos || 3
    });

    const cursoSalvo = await novoCurso.save();
    
    res.status(201).json({
      success: true,
      data: cursoSalvo
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um curso com este nome ou código'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Erro ao criar curso',
      error: err.message
    });
  }
});

// Outras rotas (PUT, DELETE, GET por ID) podem ser adicionadas aqui

module.exports = router;