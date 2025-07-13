const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
let alunoEditando = null;

// Carrega cursos no dropdown
async function carregarCursos() {
  try {
    const response = await fetch(`${API_URL}/api/cursos`);
    const cursos = await response.json();
    
    const select = document.getElementById('curso');
    select.innerHTML = '<option value="">Selecione um curso</option>';
    
    cursos.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso._id;
      option.textContent = curso.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    // Fallback com os cursos essenciais
    const cursosFallback = [
      { _id: '1', nome: 'Engenharia Informática' },
      { _id: '2', nome: 'Gestão' },
      { _id: '3', nome: 'Medicina' },
      { _id: '4', nome: 'Engenharia Redes e Sistemas Computacionais' }
    ];
    renderizarCursos(cursosFallback);
  }
}

// Função para renderizar cursos (fallback)
function renderizarCursos(cursos) {
  const select = document.getElementById('curso');
  select.innerHTML = '<option value="">Selecione um curso</option>';
  
  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso._id;
    option.textContent = curso.nome;
    select.appendChild(option);
  });
}

// Restante do seu código para gerenciar alunos...
// [Mantenha todas as funções existentes de alunos]