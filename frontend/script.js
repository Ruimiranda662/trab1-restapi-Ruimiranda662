const baseURL = "http://localhost:3000/alunos";

async function carregarAlunos() {
  const res = await fetch(baseURL);
  const alunos = await res.json();
  const container = document.getElementById("alunos-container");
  container.innerHTML = alunos.map(a => 
    `<p>${a.nome} ${a.apelido} - ${a.curso} (Ano ${a.anoCurricular})</p>`
  ).join('');
}

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const apelido = document.getElementById("apelido").value;
  const curso = document.getElementById("curso").value;
  const anoCurricular = parseInt(document.getElementById("anoCurricular").value);

  await fetch(baseURL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nome, apelido, curso, anoCurricular })
  });

  carregarAlunos();
});

window.onload = carregarAlunos;