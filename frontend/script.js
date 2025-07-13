const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
let editingId = null;

// Cache de elementos DOM
const DOM = {
  form: document.getElementById('alunoForm'),
  nomeInput: document.getElementById('nome'),
  apelidoInput: document.getElementById('apelido'),
  cursoSelect: document.getElementById('curso'),
  anoSelect: document.getElementById('anoCurricular'),
  tableBody: document.querySelector('#alunosTable tbody'),
  cancelBtn: document.getElementById('cancelBtn'),
  loadingOverlay: document.getElementById('loading-overlay'),
  alertContainer: document.getElementById('alert-container')
};

// Constantes
const DEFAULT_COURSE_OPTION = '<option value="">Selecione um curso</option>';
const ALERT_DISPLAY_TIME = 5000; // 5 segundos

// Inicialização
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
  try {
    await Promise.all([loadCourses(), loadStudents()]);
    setupEventListeners();
  } catch (error) {
    console.error('Erro na inicialização:', error);
    showAlert('Falha ao carregar dados iniciais', 'error');
  }
}

// ==================== FUNÇÕES DE CARREGAMENTO ====================

async function loadCourses() {
  try {
    showLoading(true, 'Carregando cursos...');
    
    const response = await fetchWithTimeout(`${API_URL}/api/cursos`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    
    const cursos = await response.json();
    renderCourseOptions(cursos);
    
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    showAlert('Erro ao carregar cursos. Usando dados locais...', 'warning');
    renderCourseOptions(getFallbackCourses());
  } finally {
    showLoading(false);
  }
}

async function loadStudents() {
  try {
    showLoading(true, 'Carregando alunos...');
    
    const response = await fetchWithTimeout(`${API_URL}/api/alunos`, {
      timeout: 5000
    });
    
    if (!response.ok) throw new Error('Falha ao carregar alunos');
    
    const alunos = await response.json();
    renderStudents(alunos);
    
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    showAlert('Erro ao carregar lista de alunos', 'error');
  } finally {
    showLoading(false);
  }
}

// ==================== FUNÇÕES DE RENDERIZAÇÃO ====================

function renderCourseOptions(cursos) {
  DOM.cursoSelect.innerHTML = DEFAULT_COURSE_OPTION;
  
  if (!cursos || cursos.length === 0) {
    DOM.cursoSelect.innerHTML = '<option value="">Nenhum curso disponível</option>';
    return;
  }

  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso._id;
    option.textContent = `${curso.nome} (${curso.codigo})`;
    option.dataset.codigo = curso.codigo;
    DOM.cursoSelect.appendChild(option);
  });
}

function renderStudents(alunos) {
  if (!alunos || alunos.length === 0) {
    DOM.tableBody.innerHTML = '<tr><td colspan="6">Nenhum aluno cadastrado</td></tr>';
    return;
  }

  DOM.tableBody.innerHTML = alunos.map(aluno => `
    <tr data-id="${aluno._id}">
      <td>${aluno._id}</td>
      <td>${aluno.nome}</td>
      <td>${aluno.apelido}</td>
      <td>${getCourseName(aluno.curso)}</td>
      <td>${aluno.anoCurricular}º</td>
      <td class="actions">
        <button class="edit-btn" aria-label="Editar aluno">Editar</button>
        <button class="delete-btn" aria-label="Excluir aluno">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function getCourseName(courseId) {
  if (!courseId) return 'N/A';
  const option = DOM.cursoSelect.querySelector(`option[value="${courseId}"]`);
  return option ? option.textContent.split(' (')[0] : 'Curso não encontrado';
}

// ==================== FUNÇÕES DE FORMULÁRIO ====================

async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = {
    nome: DOM.nomeInput.value.trim(),
    apelido: DOM.apelidoInput.value.trim(),
    curso: DOM.cursoSelect.value,
    anoCurricular: DOM.anoSelect.value
  };

  if (!validateForm(formData)) return;

  try {
    showLoading(true, 'Salvando dados...');
    
    const url = editingId ? `${API_URL}/api/alunos/${editingId}` : `${API_URL}/api/alunos`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetchWithTimeout(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      timeout: 8000
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha na requisição');
    }

    resetForm();
    await loadStudents();
    showAlert(`Aluno ${editingId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
    editingId = null;
    
  } catch (error) {
    console.error('Erro no formulário:', error);
    showAlert(error.message || 'Erro ao processar formulário', 'error');
  } finally {
    showLoading(false);
  }
}

function validateForm({ nome, apelido, curso }) {
  const errors = [];
  
  if (!nome) errors.push('Nome é obrigatório');
  if (!apelido) errors.push('Apelido é obrigatório');
  if (!curso) errors.push('Selecione um curso');
  
  if (errors.length > 0) {
    showAlert(errors.join('<br>'), 'error');
    return false;
  }
  
  return true;
}

function resetForm() {
  DOM.form.reset();
  editingId = null;
  DOM.form.scrollIntoView({ behavior: 'smooth' });
}

// ==================== FUNÇÕES DE INTERAÇÃO ====================

async function handleEdit(studentId) {
  try {
    showLoading(true, 'Carregando aluno...');
    
    const response = await fetchWithTimeout(`${API_URL}/api/alunos/${studentId}`, {
      timeout: 5000
    });
    
    if (!response.ok) throw new Error('Aluno não encontrado');
    
    const aluno = await response.json();
    fillForm(aluno);
    editingId = studentId;
    
  } catch (error) {
    console.error('Erro ao editar:', error);
    showAlert('Falha ao carregar dados do aluno', 'error');
  } finally {
    showLoading(false);
  }
}

function fillForm(aluno) {
  DOM.nomeInput.value = aluno.nome || '';
  DOM.apelidoInput.value = aluno.apelido || '';
  DOM.cursoSelect.value = aluno.curso || '';
  DOM.anoSelect.value = aluno.anoCurricular || '1';
  
  // Scroll para o formulário
  DOM.form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleDelete(studentId) {
  if (!confirm('Tem certeza que deseja excluir este aluno permanentemente?')) {
    return;
  }

  try {
    showLoading(true, 'Excluindo aluno...');
    
    const response = await fetchWithTimeout(`${API_URL}/api/alunos/${studentId}`, {
      method: 'DELETE',
      timeout: 5000
    });
    
    if (!response.ok) throw new Error('Falha ao excluir');
    
    await loadStudents();
    showAlert('Aluno excluído com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao excluir:', error);
    showAlert('Falha ao excluir aluno', 'error');
  } finally {
    showLoading(false);
  }
}

// ==================== UTILITÁRIOS ====================

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  
  clearTimeout(id);
  return response;
}

function getFallbackCourses() {
  return [
    { _id: '1', nome: 'Engenharia de Software', codigo: 'ESOFT' },
    { _id: '2', nome: 'Ciência da Computação', codigo: 'CCOMP' }
  ];
}

function showLoading(show, text = '') {
  DOM.loadingOverlay.innerHTML = show
    ? `<div class="loading-spinner"></div>${text ? `<p>${text}</p>` : ''}`
    : '';
  DOM.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = message;
  alert.setAttribute('role', 'alert');
  
  DOM.alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, ALERT_DISPLAY_TIME);
}

// ==================== CONFIGURAÇÃO DE EVENTOS ====================

function setupEventListeners() {
  DOM.form.addEventListener('submit', handleSubmit);
  DOM.cancelBtn.addEventListener('click', resetForm);
  
  // Delegação de eventos para a tabela
  DOM.tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    
    const studentId = row.dataset.id;
    if (!studentId) return;
    
    if (e.target.classList.contains('edit-btn')) {
      handleEdit(studentId);
    }
    
    if (e.target.classList.contains('delete-btn')) {
      handleDelete(studentId);
    }
  });
}