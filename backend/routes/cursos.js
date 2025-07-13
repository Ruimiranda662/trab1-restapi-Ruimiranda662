const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// Rota GET para listar todos os cursos
router.get('/', async (req, res) => {
    try {
        console.log('Tentando buscar cursos no banco de dados...'); // Log de depuração
        const cursos = await Curso.find();
        
        if (!cursos || cursos.length === 0) {
            console.log('Nenhum curso encontrado no banco de dados');
            return res.status(404).json({ 
                success: false,
                message: 'Nenhum curso encontrado' 
            });
        }

        console.log('Cursos encontrados:', cursos); // Log de depuração
        res.status(200).json({
            success: true,
            data: cursos
        });
    } catch (err) {
        console.error('Erro ao buscar cursos:', err); // Log de erro detalhado
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar cursos',
            error: err.message
        });
    }
});

// Rota POST para criar novo curso
router.post('/', async (req, res) => {
    try {
        const { nome, codigo } = req.body;
        
        // Validação básica
        if (!nome || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Nome e código são obrigatórios'
            });
        }

        const novoCurso = new Curso({
            nome: nome.trim(),
            codigo: codigo.trim().toUpperCase()
        });

        const cursoSalvo = await novoCurso.save();
        
        res.status(201).json({
            success: true,
            data: cursoSalvo
        });
    } catch (err) {
        console.error('Erro ao criar curso:', err);
        
        // Tratamento específico para erros de duplicação
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

// Exportação CORRETA do router
module.exports = router;