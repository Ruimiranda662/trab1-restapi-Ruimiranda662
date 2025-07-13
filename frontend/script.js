const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
let editingId = null;

// Elementos DOM
const elements = {
  form: document.getElementById('alunoForm'),
  nome: document.getElementById('nome'),
  apelido: document.getElementById('apelido'),
  curso: document.getElementById('curso'),
  ano: document.getElementById('anoCurricular'),
  tableBody: document.querySelector('#alunosTable tbody'),
  cancelBtn: document.getElementById('cancelBtn'),
  loading: document.getElementById('loading-overlay'),
  alerts: document.getElementById('alert-container')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  try {
    await loadCourses();
    await loadStudents();
    setupEventListeners();
  } catch (error) {
    showAlert('Falha ao inicializar aplicação', 'error');
    console.error(error);
  }
}

// ================ FUNÇÕES PRINCIPAIS ================

async function saveStudent(formData) {
  const url = editingId ? `${API_URL}/api/alunos/${editingId}` : `${API_URL}/api/alunos`;
  const method = editingId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao salvar aluno');
  }

  return await response.json();
}

async function deleteStudent(id) {
  const response = await fetch(`${API_URL}/api/alunos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir aluno');
  }
}

// ================ FUNÇÕES AUXILIARES ================

async function loadCourses() {
  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/api/cursos`);
    
    if (!response.ok) throw new Error('Erro ao carregar cursos');
    
    const cursos = await response.json();
    renderCourses(cursos);
  } catch (error) {
    console.error(error);
    showAlert('Erro ao carregar cursos', 'error');
    renderCourses(getFallbackCourses());
  } finally {
    showLoading(false);
  }
}

async function loadStudents() {
  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/api/alunos`);
    
    if (!response.ok) throw new Error('Erro ao carregar alunos');
    
    const alunos = await response.json();
    renderStudents(alunos);
  } catch (error) {
    console.error(error);
    showAlert('Erro ao carregar alunos', 'error');
  } finally {
    showLoading(false);
  }
}

function renderCourses(cursos) {
  elements.curso.innerHTML = '<option value="">Selecione um curso</option>';
  
  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso._id;
    option.textContent = curso.nome;
    elements.curso.appendChild(option);
  });
}

function renderStudents(alunos) {
  elements.tableBody.innerHTML = alunos.map(aluno => `
    <tr data-id="${aluno._id}">
      <td>${aluno._id}</td>
      <td>${aluno.nome}</td>
      <td>${aluno.apelido}</td>
      <td>${getCourseName(aluno.curso)}</td>
      <td>${aluno.anoCurricular}º</td>
      <td class="actions">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function getCourseName(courseId) {
  const option = elements.curso.querySelector(`option[value="${courseId}"]`);
  return option ? option.textContent : 'N/A';
}

// ================ MANIPULAÇÃO DE EVENTOS ================

function setupEventListeners() {
  elements.form.addEventListener('submit', handleSubmit);
  elements.cancelBtn.addEventListener('click', resetForm);
  elements.tableBody.addEventListener('click', handleTableClick);
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = {
    nome: elements.nome.value.trim(),
    apelido: elements.apelido.value.trim(),
    curso: elements.curso.value,
    anoCurricular: elements.ano.value
  };

  if (!validateForm(formData)) return;

  try {
    showLoading(true);
    await saveStudent(formData);
    await loadStudents();
    showAlert(`Aluno ${editingId ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
    resetForm();
  } catch (error) {
    console.error(error);
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

function handleTableClick(e) {
  const row = e.target.closest('tr');
  if (!row) return;

  const id = row.dataset.id;
  
  if (e.target.classList.contains('edit-btn')) {
    editStudent(id);
  }
  
  if (e.target.classList.contains('delete-btn')) {
    deleteStudentHandler(id);
  }
}

async function editStudent(id) {
  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/api/alunos/${id}`);
    
    if (!response.ok) throw new Error('Aluno não encontrado');
    
    const aluno = await response.json();
    
    elements.nome.value = aluno.nome;
    elements.apelido.value = aluno.apelido;
    elements.curso.value = aluno.curso;
    elements.ano.value = aluno.anoCurricular;
    
    editingId = id;
    elements.form.scrollIntoView();
    
  } catch (error) {
    console.error(error);
    showAlert('Erro ao carregar aluno', 'error');
  } finally {
    showLoading(false);
  }
}

async function deleteStudentHandler(id) {
  if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
  
  try {
    showLoading(true);
    await deleteStudent(id);
    await loadStudents();
    showAlert('Aluno excluído com sucesso!', 'success');
  } catch (error) {
    console.error(error);
    showAlert('Erro ao excluir aluno', 'error');
  } finally {
    showLoading(false);
  }
}

// ================ FUNÇÕES UTILITÁRIAS ================

function validateForm({ nome, apelido, curso }) {
  if (!nome) {
    showAlert('Preencha o nome do aluno', 'error');
    return false;
  }
  
  if (!apelido) {
    showAlert('Preencha o apelido do aluno', 'error');
    return false;
  }
  
  if (!curso) {
    showAlert('Selecione um curso', 'error');
    return false;
  }
  
  return true;
}

function resetForm() {
  elements.form.reset();
  editingId = null;
}

function showLoading(show) {
  elements.loading.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.textContent = message;
  elements.alerts.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function getFallbackCourses() {
  return [
    { _id: '1', nome: 'Engenharia de Software' },
    { _id: '2', nome: 'Ciência da Computação' }
  ];
}