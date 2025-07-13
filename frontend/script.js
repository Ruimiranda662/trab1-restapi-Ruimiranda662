const API_URL = "https://trab1-restapi-ruimiranda662.onrender.com";

async function carregarAlunos() {
  const res = await fetch(API_URL);
  const dados = await res.json();
  const lista = document.getElementById("lista-alunos");

  lista.innerHTML = dados.map(aluno => `
    <li>${aluno.nome} ${aluno.apelido} (${aluno.curso} - ${aluno.anoCurricular}º)</li>
  `).join("");
}

carregarAlunos();