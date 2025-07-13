const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";

// 1. Carregar cursos para o dropdown
async function carregarCursos() {
  try {
    const response = await fetch(`${API_URL}/api/cursos`); // Supondo que a rota seja /api/cursos
    const cursos = await response.json();
    
    const selectCurso = document.getElementById("selectCurso"); // Substitua pelo ID do seu <select>
    
    cursos.forEach(curso => {
      const option = document.createElement("option");
      option.value = curso._id; // Usa o ID do curso
      option.textContent = curso.nome; // Mostra o nome do curso
      selectCurso.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar cursos:", err);
  }
}

// 2. Carregar alunos (como você já tinha)
async function carregarAlunos() {
  try {
    const res = await fetch(`${API_URL}/api/alunos`); // Supondo que a rota seja /api/alunos
    const dados = await res.json();
    const lista = document.getElementById("lista-alunos");

    lista.innerHTML = dados.map(aluno => `
      <li>${aluno.nome} ${aluno.apelido} (${aluno.curso} - ${aluno.anoCurricular}º)</li>
    `).join("");
  } catch (err) {
    console.error("Erro ao carregar alunos:", err);
  }
}

// 3. Vincular evento de envio do formulário (para adicionar aluno com curso)
document.getElementById("form-aluno").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = {
    nome: document.getElementById("nome").value,
    apelido: document.getElementById("apelido").value,
    curso: document.getElementById("selectCurso").value, // ID do curso selecionado
    anoCurricular: document.getElementById("ano").value
  };

  try {
    const response = await fetch(`${API_URL}/api/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      carregarAlunos(); // Atualiza a lista após adicionar
    }
  } catch (err) {
    console.error("Erro ao adicionar aluno:", err);
  }
});

// Inicialização
carregarCursos(); // Carrega os cursos no dropdown
carregarAlunos(); // Carrega a lista de alunos