const express = require('express');

const router = express.Router();

const emprestimoController =
    require('../controllers/emprestimoController');


// Listar todos os empréstimos
router.get(
    '/listar',
    emprestimoController.listarEmprestimos
);


// Buscar dados do resumo
router.get(
    '/resumo',
    emprestimoController.resumoEmprestimos
);


// Buscar um empréstimo pelo ID
router.get(
    '/:id',
    emprestimoController.obterEmprestimo
);


// Cadastrar um novo empréstimo
router.post(
    '/',
    emprestimoController.criarEmprestimo
);


// Alterar um empréstimo
router.put(
    '/:id',
    emprestimoController.atualizarEmprestimo
);


// Registrar devolução
router.put(
    '/:id/devolver',
    emprestimoController.devolverEmprestimo
);


// Excluir um empréstimo
router.delete(
    '/:id',
    emprestimoController.deletarEmprestimo
);


module.exports = router;