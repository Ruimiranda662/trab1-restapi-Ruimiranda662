const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
let alunoEditando = null;

// Elementos DOM
const form = document.getElementById('alunoForm');
const tabela = document.querySelector('#alunosTable tbody');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await carregarCursos();
  await carregarAlunos();
  configurarEventos();
});

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
    alert('Erro ao carregar cursos');
  }
}

// Carrega alunos na tabela
async function carregarAlunos() {
  try {
    const response = await fetch(`${API_URL}/api/alunos?populate=curso`);
    const alunos = await response.json();
    
    tabela.innerHTML = alunos.map(aluno => `
      <tr data-id="${aluno._id}">
        <td>${aluno.nome}</td>
        <td>${aluno.apelido}</td>
        <td>${aluno.curso?.nome || 'N/A'}</td>
        <td>${aluno.anoCurricular}º</td>
        <td>
          <button class="editar">Editar</button>
          <button class="excluir">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    alert('Erro ao carregar alunos');
  }
}

// Configura eventos
function configurarEventos() {
  // Submit do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const aluno = {
      nome: form.nome.value,
      apelido: form.apelido.value,
      curso: form.curso.value,
      anoCurricular: form.anoCurricular.value
    };
    
    try {
      const url = alunoEditando 
        ? `${API_URL}/api/alunos/${alunoEditando}` 
        : `${API_URL}/api/alunos`;
      
      const method = alunoEditando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aluno)
      });
      
      if (response.ok) {
        form.reset();
        alunoEditando = null;
        await carregarAlunos();
        alert('Aluno salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno');
    }
  });
  
  // Eventos de editar/excluir
  tabela.addEventListener('click', async (e) => {
    const linha = e.target.closest('tr');
    if (!linha) return;
    
    const id = linha.dataset.id;
    
    if (e.target.classList.contains('editar')) {
      await editarAluno(id);
    }
    
    if (e.target.classList.contains('excluir')) {
      if (confirm('Tem certeza que deseja excluir este aluno?')) {
        await excluirAluno(id);
      }
    }
  });
}

// Editar aluno
async function editarAluno(id) {
  try {
    const response = await fetch(`${API_URL}/api/alunos/${id}`);
    const aluno = await response.json();
    
    form.nome.value = aluno.nome;
    form.apelido.value = aluno.apelido;
    form.curso.value = aluno.curso?._id || '';
    form.anoCurricular.value = aluno.anoCurricular;
    
    alunoEditando = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    alert('Erro ao carregar dados do aluno');
  }
}

// Excluir aluno
async function excluirAluno(id) {
  try {
    const response = await fetch(`${API_URL}/api/alunos/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await carregarAlunos();
      alert('Aluno excluído com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    alert('Erro ao excluir aluno');
  }
}