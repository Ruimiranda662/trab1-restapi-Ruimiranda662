const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// GET todos os cursos
router.get('/', async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
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
    const { nome, codigo } = req.body;
    
    if (!nome || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Nome e código são obrigatórios'
      });
    }

    const curso = new Curso({
      nome: nome.trim(),
      codigo: codigo.trim().toUpperCase()
    });

    const cursoSalvo = await curso.save();
    
    res.status(201).json({
      success: true,
      data: cursoSalvo
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Curso já existe com este nome ou código'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro ao criar curso',
      error: err.message
    });
  }
});

module.exports = router;