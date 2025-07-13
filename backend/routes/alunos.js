const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// Rota GET para listar TODOS os alunos
router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.find({});
    res.status(200).send(alunos);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota GET para buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno) {
      return res.status(404).send({ error: 'Aluno não encontrado' });
    }
    res.send(aluno);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota POST para criar aluno (você já tinha essa)
router.post('/', async (req, res) => {
  try {
    const aluno = new Aluno(req.body);
    await aluno.save();
    res.status(201).send(aluno);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Rota PUT para atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aluno) {
      return res.status(404).send({ error: 'Aluno não encontrado' });
    }
    res.send(aluno);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Rota DELETE para remover aluno
router.delete('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) {
      return res.status(404).send({ error: 'Aluno não encontrado' });
    }
    res.send({ message: 'Aluno removido com sucesso' });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;