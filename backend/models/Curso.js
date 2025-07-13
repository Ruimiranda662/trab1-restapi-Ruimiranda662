const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true,
    unique: true  // Ensure course names are unique
  },
  codigo: { 
    type: String, 
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{4,5}$/, 'Código deve ter 4-5 letras maiúsculas'] 
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Curso', cursoSchema);