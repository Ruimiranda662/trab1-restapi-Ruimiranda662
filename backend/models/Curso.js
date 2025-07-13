const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // Ex: "Engenharia de Software"
  codigo: { type: String, unique: true }, // Ex: "ESOFT"
});

module.exports = mongoose.model('Curso', cursoSchema);