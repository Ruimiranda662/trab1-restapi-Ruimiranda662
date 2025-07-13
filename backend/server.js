require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const alunosRouter = require('./routes/alunosrotas');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/alunos', alunosRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(3000, () => console.log('Servidor a correr na porta 3000')))
  .catch(err => console.error(err));
