const express = require('express');
const multer = require('multer');

const router = express.Router();

const livroController = require('../controllers/livroController');


// ======================================================
// CONFIGURAÇÃO DO MULTER
// ======================================================

const upload = multer({
    storage: multer.memoryStorage()
});


// ======================================================
// ROTAS DE LIVRO
// ======================================================

// Listar todos os livros
router.get(
    '/listar',
    livroController.listarLivros
);

// Upload da imagem
router.post(
    '/upload/:id',
    upload.single('imagem'),
    livroController.uploadImagem
);

// Procurar um livro pelo ID
router.get(
    '/:id',
    livroController.obterLivro
);

// Cadastrar um novo livro
router.post(
    '/',
    livroController.criarLivro
);

// Alterar um livro
router.put(
    '/:id',
    livroController.atualizarLivro
);

// Excluir um livro
router.delete(
    '/:id',
    livroController.deletarLivro
);


module.exports = router;