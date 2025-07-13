const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
let editingId = null;

// Elementos do DOM
const form = document.getElementById('alunoForm');
const nomeInput = document.getElementById('nome');
const apelidoInput = document.getElementById('apelido');
const cursoSelect = document.getElementById('curso');
const anoSelect = document.getElementById('anoCurricular');
const tableBody = document.querySelector('#alunosTable tbody');
const cancelBtn = document.getElementById('cancelBtn');
const loadingOverlay = document.getElementById('loading-overlay');
const alertContainer = document.getElementById('alert-container');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await loadCourses();
  await loadStudents();
  setupEventListeners();
});

// Função para mostrar loading
function showLoading(show, text = '') {
  loadingOverlay.innerHTML = show 
    ? `<div class="loading-spinner"></div><p>${text}</p>`
    : '';
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Função para mostrar alertas
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `status-message ${type}-message`;
  alert.textContent = message;
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// Carrega cursos no dropdown
async function loadCourses() {
  try {
    showLoading(true, 'Carregando cursos...');
    const response = await fetch(`${API_URL}/api/cursos`);
    
    if (!response.ok) throw new Error('Erro ao carregar cursos');
    
    const cursos = await response.json();
    cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
    
    cursos.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso._id;
      option.textContent = `${curso.nome} (${curso.codigo})`;
      cursoSelect.appendChild(option);
    });
  } catch (error) {
    showAlert('Erro ao carregar cursos', 'error');
    console.error(error);
  } finally {
    showLoading(false);
  }
}

// [Restante do código permanece igual...]
// ... mantendo todas as outras funções (loadStudents, handleSubmit, etc.)