const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// GET todos os alunos (com populate do curso)
router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.find().populate('curso');
    res.json({
      success: true,
      count: alunos.length,
      data: alunos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos',
      error: err.message
    });
  }
});

// POST criar novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, apelido, curso, anoCurricular } = req.body;
    
    // Validação básica
    if (!nome || !apelido || !curso) {
      return res.status(400).json({
        success: false,
        message: 'Nome, apelido e curso são obrigatórios'
      });
    }

    const aluno = new Aluno({
      nome,
      apelido,
      curso,
      anoCurricular: anoCurricular || '1'
    });

    const alunoSalvo = await aluno.save();
    
    // Popula o curso antes de retornar
    const alunoComCurso = await Aluno.findById(alunoSalvo._id).populate('curso');
    
    res.status(201).json({
      success: true,
      data: alunoComCurso
    });
    
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Aluno já existe com esses dados'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aluno',
      error: err.message
    });
  }
});

// PUT atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('curso');
    
    if (!alunoAtualizado) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: alunoAtualizado
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar aluno',
      error: err.message
    });
  }
});

// DELETE remover aluno
router.delete('/:id', async (req, res) => {
  try {
    const alunoRemovido = await Aluno.findByIdAndDelete(req.params.id);
    
    if (!alunoRemovido) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Aluno removido com sucesso'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover aluno',
      error: err.message
    });
  }
});

module.exports = router;