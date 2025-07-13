const mongoose = require('mongoose');
const Curso = require('./models/Curso');
require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Cursos que você quer garantir no sistema
    const cursosDesejados = [
      { nome: "Engenharia Informática", codigo: "EINF" },
      { nome: "Gestão", codigo: "GEST" },
      { nome: "Medicina", codigo: "MED" },
      { nome: "Engenharia Redes e Sistemas Computacionais", codigo: "ERSC" }
    ];

    // Remove cursos antigos e insere os novos
    await Curso.deleteMany({});
    await Curso.insertMany(cursosDesejados);
    
    console.log('✅ Cursos resetados com sucesso!');
    console.log(await Curso.find());
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao resetar cursos:', err);
    process.exit(1);
  }
}

seedDatabase();