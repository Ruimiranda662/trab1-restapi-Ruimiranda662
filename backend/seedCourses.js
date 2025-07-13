const mongoose = require('mongoose');
const Curso = require('./models/Curso');
require('dotenv').config();

const cursosPadrao = [
  {
    nome: "Engenharia Informática",
    codigo: "EINF",
    descricao: "Curso de formação de engenheiros informáticos",
    duracaoAnos: 3
  },
  {
    nome: "Gestão",
    codigo: "GEST",
    descricao: "Curso de gestão empresarial",
    duracaoAnos: 3
  },
  {
    nome: "Medicina",
    codigo: "MED",
    descricao: "Curso de formação médica",
    duracaoAnos: 6
  },
  {
    nome: "Engenharia Redes e Sistemas Computacionais",
    codigo: "ERSC",
    descricao: "Curso de redes e sistemas computacionais",
    duracaoAnos: 3
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexão com MongoDB estabelecida');

    // Verifica se já existem cursos
    const count = await Curso.countDocuments();
    if (count === 0) {
      await Curso.insertMany(cursosPadrao);
      console.log('📚 Cursos padrão criados:');
      console.log(await Curso.findAllActive());
    } else {
      console.log('ℹ️  O banco de dados já contém cursos. Nenhuma ação necessária.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao popular banco de dados:', err);
    process.exit(1);
  }
}

seedDatabase();