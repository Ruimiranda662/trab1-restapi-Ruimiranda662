const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

router.get('/', async (req, res) => {
  const alunos = await Aluno.find();
  res.json(alunos);
});

router.post('/', async (req, res) => {
  const novo = new Aluno(req.body);
  await novo.save();
  res.status(201).json(novo);
});

module.exports = router;
