document.addEventListener('DOMContentLoaded', function() {
    const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";
    let editingId = null;

    // DOM Elements
    const form = document.getElementById('alunoForm');
    const nomeInput = document.getElementById('nome');
    const apelidoInput = document.getElementById('apelido');
    const cursoSelect = document.getElementById('curso');
    const anoSelect = document.getElementById('anoCurricular');
    const tableBody = document.querySelector('#alunosTable tbody');
    const cancelBtn = document.getElementById('cancelBtn');

    // Initialize app
    init();

    async function init() {
        await loadCourses();
        await loadStudents();
        setupEventListeners();
    }

    // Load courses into dropdown
    async function loadCourses() {
        try {
            showLoading(true, 'Carregando cursos...');
            
            const response = await fetch(`${API_URL}/api/cursos`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const cursos = await response.json();
            console.log('Courses loaded:', cursos); // Debug log
            
            cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
            
            if (cursos && cursos.length > 0) {
                cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso._id;
                    option.textContent = curso.nome;
                    cursoSelect.appendChild(option);
                });
            } else {
                console.warn('No courses found in API response');
                cursoSelect.innerHTML = '<option value="">Nenhum curso disponível</option>';
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            showAlert('Erro ao carregar cursos. Tente recarregar a página.', 'error');
            
            // Fallback: Add sample courses if API fails
            addSampleCourses();
        } finally {
            showLoading(false);
        }
    }

    // Temporary fallback function
    function addSampleCourses() {
        const sampleCourses = [
            { _id: '1', nome: 'Engenharia de Software' },
            { _id: '2', nome: 'Ciência da Computação' }
        ];
        
        sampleCourses.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso._id;
            option.textContent = curso.nome;
            cursoSelect.appendChild(option);
        });
    }

    // Load students into table
    async function loadStudents() {
        try {
            showLoading(true, 'Carregando alunos...');
            const response = await fetch(`${API_URL}/api/alunos`);
            
            if (!response.ok) throw new Error('Erro ao carregar alunos');
            
            const alunos = await response.json();
            renderStudents(alunos);
        } catch (error) {
            console.error('Error loading students:', error);
            showAlert('Erro ao carregar alunos', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Render students in table
    function renderStudents(alunos) {
        tableBody.innerHTML = alunos.map(aluno => `
            <tr>
                <td>${aluno._id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.apelido}</td>
                <td>${getCourseName(aluno.curso)}</td>
                <td>${aluno.anoCurricular}º</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${aluno._id}">Editar</button>
                    <button class="delete-btn" data-id="${aluno._id}">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Helper to get course name
    function getCourseName(courseId) {
        if (!courseId) return 'N/A';
        const option = cursoSelect.querySelector(`option[value="${courseId}"]`);
        return option ? option.textContent : 'Curso desconhecido';
    }

    // Form submission handler
    async function handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            nome: nomeInput.value.trim(),
            apelido: apelidoInput.value.trim(),
            curso: cursoSelect.value,
            anoCurricular: anoSelect.value
        };

        // Validation
        if (!formData.nome || !formData.apelido || !formData.curso) {
            showAlert('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        try {
            showLoading(true, 'Salvando aluno...');
            
            const url = editingId ? `${API_URL}/api/alunos/${editingId}` : `${API_URL}/api/alunos`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Falha ao salvar aluno');

            resetForm();
            await loadStudents();
            showAlert(`Aluno ${editingId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
            editingId = null;
        } catch (error) {
            console.error('Error saving student:', error);
            showAlert('Erro ao salvar aluno', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Edit student handler
    async function handleEdit(studentId) {
        try {
            showLoading(true, 'Carregando aluno...');
            const response = await fetch(`${API_URL}/api/alunos/${studentId}`);
            
            if (!response.ok) throw new Error('Falha ao carregar aluno');
            
            const aluno = await response.json();
            
            // Fill form
            nomeInput.value = aluno.nome;
            apelidoInput.value = aluno.apelido;
            cursoSelect.value = aluno.curso || '';
            anoSelect.value = aluno.anoCurricular;
            
            editingId = studentId;
            form.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading student:', error);
            showAlert('Erro ao carregar aluno', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Delete student handler
    async function handleDelete(studentId) {
        if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
        
        try {
            showLoading(true, 'Excluindo aluno...');
            const response = await fetch(`${API_URL}/api/alunos/${studentId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Falha ao excluir aluno');
            
            await loadStudents();
            showAlert('Aluno excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Error deleting student:', error);
            showAlert('Erro ao excluir aluno', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Reset form
    function resetForm() {
        form.reset();
        editingId = null;
    }

    // Setup event listeners
    function setupEventListeners() {
        form.addEventListener('submit', handleSubmit);
        cancelBtn.addEventListener('click', resetForm);
        
        // Event delegation for dynamic buttons
        tableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-btn')) {
                handleEdit(e.target.dataset.id);
            }
            if (e.target.classList.contains('delete-btn')) {
                handleDelete(e.target.dataset.id);
            }
        });
    }

    // Show loading state
    function showLoading(show, text = '') {
        const loader = document.getElementById('loading-overlay');
        if (show) {
            loader.innerHTML = `
                <div class="loading-spinner"></div>
                ${text ? `<p>${text}</p>` : ''}
            `;
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }

    // Show alert message
    function showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        
        const container = document.getElementById('alert-container') || document.body;
        container.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
});