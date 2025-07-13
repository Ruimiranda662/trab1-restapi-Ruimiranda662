const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// GET all courses
router.get('/', async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ 
      error: 'Erro ao carregar cursos',
      details: err.message 
    });
  }
});

// POST new course
router.post('/', async (req, res) => {
  try {
    const { nome, codigo } = req.body;
    
    if (!nome || !codigo) {
      return res.status(400).json({ error: 'Nome e código são obrigatórios' });
    }

    const newCourse = new Curso({
      nome: nome.trim(),
      codigo: codigo.trim().toUpperCase()
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Curso já existe' });
    } else {
      res.status(500).json({ 
        error: 'Erro ao criar curso',
        details: err.message 
      });
    }
  }
});

module.exports = router;