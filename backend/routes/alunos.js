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