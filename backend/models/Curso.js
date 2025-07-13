const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome do curso é obrigatório'],
    unique: true,
    trim: true
  },
  codigo: { 
    type: String, 
    required: [true, 'Código do curso é obrigatório'],
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3,5}$/.test(v);
      },
      message: 'Código deve ter entre 3 a 5 letras maiúsculas'
    }
  },
  descricao: {
    type: String,
    maxlength: 200
  },
  ativo: {
    type: Boolean,
    default: true
  },
  duracaoAnos: {
    type: Number,
    min: 1,
    max: 6,
    default: 3
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Métodos estáticos melhorados
cursoSchema.statics.findAllActive = async function() {
  return await this.find({ ativo: true }).sort({ nome: 1 });
};

cursoSchema.statics.findByCode = async function(codigo) {
  return await this.findOne({ codigo: codigo.toUpperCase() });
};

// Virtual para exibição formatada
cursoSchema.virtual('codigoNome').get(function() {
  return `${this.codigo} - ${this.nome}`;
});

module.exports = mongoose.model('Curso', cursoSchema);