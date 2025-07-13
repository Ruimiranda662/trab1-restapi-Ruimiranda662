const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno'); // Ajuste o caminho conforme sua estrutura

// Rota POST para criar aluno
router.post('/', async (req, res) => {
  try {
    const aluno = new Aluno(req.body);
    await aluno.save();
    res.status(201).send(aluno);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;