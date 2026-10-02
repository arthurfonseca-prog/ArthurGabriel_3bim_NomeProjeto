const express = require('express');
const multer = require('multer');

const router = express.Router();

const pessoaController = require('../controllers/pessoaController');

const upload = multer({
    storage: multer.memoryStorage()
});

// LISTAR
router.get('/listar', pessoaController.listarPessoas);

// OBTER
router.get('/:id', pessoaController.obterPessoa);

// CRIAR
router.post('/', pessoaController.criarPessoa);

// ATUALIZAR
router.put('/:id', pessoaController.atualizarPessoa);

// DELETAR
router.delete('/:id', pessoaController.deletarPessoa);

// UPLOAD DA FOTO
router.post(
    '/upload/:id',
    upload.single('imagem'),
    pessoaController.uploadImagem
);

module.exports = router;