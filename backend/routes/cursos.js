const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// Rota GET para cursos - Modificada para debug
router.get('/', async (req, res) => {
  try {
    console.log("Acessando rota /api/cursos"); // Debug
    const cursos = await Curso.find().lean();
    
    console.log("Cursos encontrados no DB:", cursos); // Debug
    
    if (!cursos || cursos.length === 0) {
      console.log("Nenhum curso encontrado no banco de dados");
      return res.status(404).json({ message: "Nenhum curso cadastrado" });
    }
    
    res.json(cursos);
  } catch (err) {
    console.error("Erro na rota /api/cursos:", err);
    res.status(500).json({ 
      message: "Erro ao buscar cursos",
      error: err.message 
    });
  }
});