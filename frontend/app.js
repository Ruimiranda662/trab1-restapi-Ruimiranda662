document.addEventListener('DOMContentLoaded', function() {
    const alunosTable = document.querySelector('#alunosTable tbody');
    const alunoForm = document.getElementById('alunoForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const cursoSelect = document.getElementById('curso');
    
    // ✅ URL do backend no Render
    const API_URL = 'https://trab1-restapi-ruimiranda662.onrender.com';
    let editingId = null;
    
    // Carregar cursos
    async function loadCursos() {
        try {
            const response = await fetch(`${API_URL}/cursos`);
            const cursos = await response.json();
            
            cursoSelect.innerHTML = '';
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.nomeDoCurso;
                option.textContent = curso.nomeDoCurso;
                cursoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    }
    
    // Carregar alunos
    async function loadAlunos() {
        try {
            const response = await fetch(`${API_URL}/alunos`);
            const alunos = await response.json();
            
            alunosTable.innerHTML = '';
            alunos.forEach(aluno => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.apelido}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.anoCurricular}º Ano</td>
                    <td>
                        <button onclick="editAluno('${aluno.id}')">Editar</button>
                        <button onclick="deleteAluno('${aluno.id}')" style="background-color: #f44336;">Apagar</button>
                    </td>
                `;
                
                alunosTable.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    }
    
    // Formulário submit
    alunoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const alunoData = {
            nome: document.getElementById('nome').value,
            apelido: document.getElementById('apelido').value,
            curso: document.getElementById('curso').value,
            anoCurricular: parseInt(document.getElementById('anoCurricular').value)
        };
        
        try {
            if (editingId) {
                // Atualizar aluno existente
                await fetch(`${API_URL}/alunos/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alunoData)
                });
            } else {
                // Criar novo aluno
                await fetch(`${API_URL}/alunos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alunoData)
                });
            }
            
            resetForm();
            loadAlunos();
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
            alert('Erro ao salvar aluno. Verifique o console.');
        }
    });
    
    // Botão cancelar
    cancelBtn.addEventListener('click', resetForm);
    
    // Funções globais
    window.editAluno = async function(id) {
        try {
            const response = await fetch(`${API_URL}/alunos/${id}`);
            const aluno = await response.json();
            
            document.getElementById('alunoId').value = aluno.id;
            document.getElementById('nome').value = aluno.nome;
            document.getElementById('apelido').value = aluno.apelido;
            document.getElementById('curso').value = aluno.curso;
            document.getElementById('anoCurricular').value = aluno.anoCurricular;
            
            editingId = aluno.id;
        } catch (error) {
            console.error('Erro ao carregar aluno:', error);
        }
    };
    
    window.deleteAluno = async function(id) {
        if (confirm('Tem certeza que deseja apagar este aluno?')) {
            try {
                await fetch(`${API_URL}/alunos/${id}`, {
                    method: 'DELETE'
                });
                loadAlunos();
            } catch (error) {
                console.error('Erro ao apagar aluno:', error);
            }
        }
    };
    
    function resetForm() {
        alunoForm.reset();
        document.getElementById('alunoId').value = '';
        editingId = null;
    }
    
    // Inicialização
    loadCursos();
    loadAlunos();
});