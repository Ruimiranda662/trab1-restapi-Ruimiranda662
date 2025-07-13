document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const alunosTable = document.querySelector('#alunosTable tbody');
    const alunoForm = document.getElementById('alunoForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const cursoSelect = document.getElementById('curso');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Configuration
    const API_BASE_URL = window.location.hostname.includes('vercel.app') 
        ? '/api' 
        : 'https://trab1-restapi-ruimiranda662.onrender.com';
    let editingId = null;

    // UI Helpers
    const showLoading = (show) => {
        loadingIndicator.style.display = show ? 'block' : 'none';
    };

    const showMessage = (message, type = 'error') => {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => messageDiv.style.display = 'none', 5000);
    };

    // API Service
    const apiService = {
        async request(endpoint, method = 'GET', data = null) {
            showLoading(true);
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                if (data) {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                showMessage(`Falha na operação: ${error.message}`);
                throw error;
            } finally {
                showLoading(false);
            }
        },

        async getCursos() {
            return this.request('/cursos');
        },

        async getAlunos() {
            return this.request('/alunos');
        },

        async createAluno(alunoData) {
            return this.request('/alunos', 'POST', alunoData);
        },

        async updateAluno(id, alunoData) {
            return this.request(`/alunos/${id}`, 'PUT', alunoData);
        },

        async deleteAluno(id) {
            return this.request(`/alunos/${id}`, 'DELETE');
        }
    };

    // Data Loaders
    const loadCursos = async () => {
        try {
            const cursos = await apiService.getCursos();
            cursoSelect.innerHTML = '<option value="">Selecione um curso</option>' + 
                cursos.map(curso => `<option value="${curso.nomeDoCurso}">${curso.nomeDoCurso}</option>`).join('');
        } catch (error) {
            showMessage('Não foi possível carregar os cursos');
        }
    };

    const loadAlunos = async () => {
        try {
            const alunos = await apiService.getAlunos();
            alunosTable.innerHTML = alunos.map(aluno => `
                <tr data-id="${aluno.id}">
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.apelido}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.anoCurricular}º Ano</td>
                    <td>
                        <button class="btn-edit" data-id="${aluno.id}">Editar</button>
                        <button class="btn-delete" data-id="${aluno.id}">Apagar</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            showMessage('Não foi possível carregar os alunos');
        }
    };

    // Form Handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const alunoData = {
            nome: alunoForm.nome.value.trim(),
            apelido: alunoForm.apelido.value.trim(),
            curso: alunoForm.curso.value,
            anoCurricular: parseInt(alunoForm.anoCurricular.value)
        };

        if (!alunoData.nome || !alunoData.curso) {
            return showMessage('Nome e curso são obrigatórios', 'warning');
        }

        try {
            if (editingId) {
                await apiService.updateAluno(editingId, alunoData);
                showMessage('Aluno atualizado com sucesso!', 'success');
            } else {
                await apiService.createAluno(alunoData);
                showMessage('Aluno criado com sucesso!', 'success');
            }
            
            resetForm();
            await loadAlunos();
        } catch (error) {
            showMessage('Falha ao salvar aluno');
        }
    };

    // Event Delegation for Actions
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            try {
                const aluno = await apiService.request(`/alunos/${id}`);
                editingId = aluno.id;
                alunoForm.nome.value = aluno.nome;
                alunoForm.apelido.value = aluno.apelido;
                alunoForm.curso.value = aluno.curso;
                alunoForm.anoCurricular.value = aluno.anoCurricular;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                showMessage('Falha ao carregar aluno');
            }
        }

        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja apagar este aluno?')) {
                try {
                    await apiService.deleteAluno(e.target.dataset.id);
                    showMessage('Aluno removido com sucesso!', 'success');
                    await loadAlunos();
                } catch (error) {
                    showMessage('Falha ao apagar aluno');
                }
            }
        }
    });

    // Form Reset
    const resetForm = () => {
        alunoForm.reset();
        editingId = null;
        document.getElementById('form-title').textContent = 'Adicionar Aluno';
    };

    // Initialize
    const init = async () => {
        try {
            showLoading(true);
            await Promise.all([loadCursos(), loadAlunos()]);
            alunoForm.addEventListener('submit', handleFormSubmit);
            cancelBtn.addEventListener('click', resetForm);
        } catch (error) {
            showMessage('Falha ao inicializar a aplicação');
        } finally {
            showLoading(false);
        }
    };

    init();
});