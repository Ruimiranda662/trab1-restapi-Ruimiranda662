const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome do curso é obrigatório'],
    unique: true
  },
  codigo: { 
    type: String, 
    required: [true, 'Código do curso é obrigatório'],
    unique: true,
    uppercase: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Adicione este método para garantir que os cursos sejam retornados mesmo se vazios
cursoSchema.statics.findAll = async function() {
  return await this.find({ ativo: true }).lean();
};

module.exports = mongoose.model('Curso', cursoSchema);