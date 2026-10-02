const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { query } = require('./database');

const livroRoutes = require('./routes/livroRoutes');
const autoresRoutes = require('./routes/autoresRoutes');
const editoraRoutes = require('./routes/editoraRoutes');
const generoRoutes = require('./routes/generoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());


// Arquivos de imagem
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));


// Arquivos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));


// Rotas da aplicação
app.use('/livro', livroRoutes);
app.use('/autor', autoresRoutes);
app.use('/editora', editoraRoutes);
app.use('/genero', generoRoutes);
app.use('/pessoa', pessoaRoutes);
app.use('/emprestimo', emprestimoRoutes);


// Porta
const PORT = process.env.PORT || 3001;


// Inicializa o servidor e testa o PostgreSQL
app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando na porta ${PORT}`);

    try {
        await query('SELECT 1');

        console.log(`✅ Banco de Dados conectado com sucesso!`);
    } catch (error) {

        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`👉 Ajuste o arquivo .env com a senha correta do seu PostgreSQL.`);
    }

    console.log(`=================================\n`);
});