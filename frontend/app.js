document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const alunosTable = document.querySelector('#alunosTable tbody');
    const alunoForm = document.getElementById('alunoForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const cursoSelect = document.getElementById('curso');
    
    // Configurações
    const API_URL = import.meta.env.VITE_API_URL || 'https://trab1-restapi-ruimiranda662.onrender.com';
    let editingId = null;

    // Helpers
    const showError = (message) => {
        alert(`Erro: ${message}`);
        console.error(message);
    };

    // API Functions
    const fetchData = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            showError(`Falha na requisição: ${error.message}`);
            throw error;
        }
    };

    // Carregar cursos
    const loadCursos = async () => {
        try {
            const cursos = await fetchData('/cursos');
            cursoSelect.innerHTML = cursos.map(curso => 
                `<option value="${curso.nomeDoCurso}">${curso.nomeDoCurso}</option>`
            ).join('');
        } catch (error) {
            showError('Falha ao carregar cursos');
        }
    };

    // Carregar alunos
    const loadAlunos = async () => {
        try {
            const alunos = await fetchData('/alunos');
            alunosTable.innerHTML = alunos.map(aluno => `
                <tr>
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.apelido}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.anoCurricular}º Ano</td>
                    <td>
                        <button onclick="editAluno('${aluno.id}')">Editar</button>
                        <button onclick="deleteAluno('${aluno.id}')" class="delete-btn">Apagar</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            showError('Falha ao carregar alunos');
        }
    };

    // Formulário submit
    alunoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(alunoForm);
        const alunoData = {
            nome: formData.get('nome'),
            apelido: formData.get('apelido'),
            curso: formData.get('curso'),
            anoCurricular: parseInt(formData.get('anoCurricular'))
        };

        try {
            if (editingId) {
                await fetchData(`/alunos/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(alunoData)
                });
            } else {
                await fetchData('/alunos', {
                    method: 'POST',
                    body: JSON.stringify(alunoData)
                });
            }
            
            resetForm();
            await loadAlunos();
        } catch (error) {
            showError('Falha ao salvar aluno');
        }
    });

    // Funções globais
    window.editAluno = async (id) => {
        try {
            const aluno = await fetchData(`/alunos/${id}`);
            editingId = aluno.id;
            document.getElementById('alunoId').value = aluno.id;
            document.getElementById('nome').value = aluno.nome;
            document.getElementById('apelido').value = aluno.apelido;
            document.getElementById('curso').value = aluno.curso;
            document.getElementById('anoCurricular').value = aluno.anoCurricular;
        } catch (error) {
            showError('Falha ao carregar aluno');
        }
    };

    window.deleteAluno = async (id) => {
        if (confirm('Tem certeza que deseja apagar este aluno?')) {
            try {
                await fetchData(`/alunos/${id}`, { method: 'DELETE' });
                await loadAlunos();
            } catch (error) {
                showError('Falha ao apagar aluno');
            }
        }
    };

    // Funções auxiliares
    const resetForm = () => {
        alunoForm.reset();
        editingId = null;
    };

    cancelBtn.addEventListener('click', resetForm);

    // Inicialização
    loadCursos();
    loadAlunos();
});