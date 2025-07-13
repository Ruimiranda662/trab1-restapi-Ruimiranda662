// Banco de dados inicial (carrega do localStorage ou do JSON padrão)
let db = JSON.parse(localStorage.getItem('db-alunos')) || {
    alunos: [
        { "id": 1, "nome": "João", "apelido": "Silva", "curso": 1, "anoCurricular": 3 },
        { "id": 2, "nome": "Maria", "apelido": "Santos", "curso": 2, "anoCurricular": 2 }
    ],
    cursos: [
        { "id": 1, "nomeDoCurso": "Engenharia Informática" },
        { "id": 2, "nomeDoCurso": "Gestão" },
        { "id": 3, "nomeDoCurso": "ERSC" }
    ]
};

// Salva dados no localStorage
function saveDB() {
    localStorage.setItem('db-alunos', JSON.stringify(db));
    showToast("Dados salvos!");
}

// Exibe mensagem flutuante
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Carrega dados iniciais (simulando fetch)
function loadDB() {
    renderCursos();
    renderAlunos();
    addSortButtons();
}

// Preenche dropdown de cursos
function renderCursos() {
    const select = document.getElementById('curso');
    select.innerHTML = '<option value="">Selecione um curso</option>';
    db.cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id;
        option.textContent = curso.nomeDoCurso;
        select.appendChild(option);
    });
}

// Renderiza a tabela de alunos
function renderAlunos() {
    const tbody = document.querySelector('#tabela-alunos tbody');
    tbody.innerHTML = '';

    if (db.alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum aluno cadastrado</td></tr>';
        return;
    }

    db.alunos.forEach(aluno => {
        const curso = db.cursos.find(c => c.id === aluno.curso)?.nomeDoCurso || 'N/A';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.apelido}</td>
            <td>${curso}</td>
            <td>${aluno.anoCurricular}º Ano</td>
            <td class="actions">
                <button class="editar" data-id="${aluno.id}">✏️ Editar</button>
                <button class="excluir" data-id="${aluno.id}">🗑️ Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualiza eventos dos botões
    document.querySelectorAll('.editar').forEach(btn => {
        btn.addEventListener('click', (e) => editAluno(parseInt(e.target.dataset.id)));
    });
    document.querySelectorAll('.excluir').forEach(btn => {
        btn.addEventListener('click', (e) => deleteAluno(parseInt(e.target.dataset.id)));
    });
}

// Validação do formulário
function validateForm(nome, apelido, curso, anoCurricular) {
    if (!nome || !apelido || !curso || !anoCurricular) {
        showToast("Preencha todos os campos!", true);
        return false;
    }
    if (anoCurricular < 1 || anoCurricular > 5) {
        showToast("Ano curricular deve ser entre 1 e 5", true);
        return false;
    }
    return true;
}

// Adiciona/Edita aluno
document.getElementById('form-aluno').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('aluno-id').value);
    const nome = document.getElementById('nome').value.trim();
    const apelido = document.getElementById('apelido').value.trim();
    const curso = parseInt(document.getElementById('curso').value);
    const anoCurricular = parseInt(document.getElementById('anoCurricular').value);

    if (!validateForm(nome, apelido, curso, anoCurricular)) return;

    if (id) {
        // Edição
        const index = db.alunos.findIndex(a => a.id === id);
        db.alunos[index] = { id, nome, apelido, curso, anoCurricular };
        showToast("Aluno atualizado!");
    } else {
        // Novo aluno
        const newId = db.alunos.length > 0 ? Math.max(...db.alunos.map(a => a.id)) + 1 : 1;
        db.alunos.push({ id: newId, nome, apelido, curso, anoCurricular });
        showToast("Aluno adicionado!");
    }

    saveDB();
    renderAlunos();
    e.target.reset();
});

// Preenche formulário para edição
function editAluno(id) {
    const aluno = db.alunos.find(a => a.id === id);
    if (!aluno) return;

    document.getElementById('aluno-id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('apelido').value = aluno.apelido;
    document.getElementById('curso').value = aluno.curso;
    document.getElementById('anoCurricular').value = aluno.anoCurricular;
    document.getElementById('nome').focus();
}

// Remove aluno
function deleteAluno(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        db.alunos = db.alunos.filter(a => a.id !== id);
        saveDB();
        renderAlunos();
        showToast("Aluno excluído!");
    }
}

// Botão Cancelar
document.getElementById('cancelar').addEventListener('click', () => {
    document.getElementById('form-aluno').reset();
    document.getElementById('aluno-id').value = '';
});

// Ordenação
function addSortButtons() {
    const container = document.createElement('div');
    container.className = 'sort-container';
    container.innerHTML = `
        <button id="sort-nome">Ordenar por Nome (A-Z)</button>
        <button id="sort-ano">Ordenar por Ano (↑)</button>
    `;
    document.querySelector('h1').after(container);

    document.getElementById('sort-nome').addEventListener('click', () => {
        db.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
        renderAlunos();
    });

    document.getElementById('sort-ano').addEventListener('click', () => {
        db.alunos.sort((a, b) => a.anoCurricular - b.anoCurricular);
        renderAlunos();
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadDB);