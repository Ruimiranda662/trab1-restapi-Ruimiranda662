# Trabalho Prático #1

**Aluno:** Rui Miranda nº31803

## 🔗 Links
<<<<<<< HEAD
- Frontend (Vercel): https://trab1-restapi-ruimiranda662-5w31.vercel.app/
=======
- Frontend (Vercel): [https://teu-front.vercel.app](https://trab1-restapi-ruimiranda662-5w31.vercel.app/)
>>>>>>> 7addfe1caf92cfb69792750e37c9bf1f7502342b
- Backend (Render): https://trab1-restapi-ruimiranda662.onrender.com

## 🚀 Como correr localmente

### Frontend
```bash
cd frontend
npx vercel dev
```

### Mock Server
```bash
cd mock-server
npm install
npm run start
```

### Backend
```bash
cd backend
npm install
npm start
```

## 🗃️ Base de Dados
```json
{
  "alunos": [ {"nome": "Ana", "apelido": "Silva", ... }],
  "cursos": [ {"nomeDoCurso": "Informática"} ]
}
```

## 🧪 API
- GET /api/alunos
- POST /api/alunos

## 🖥️ Frontend
Simples página que lista os alunos via Fetch API.
