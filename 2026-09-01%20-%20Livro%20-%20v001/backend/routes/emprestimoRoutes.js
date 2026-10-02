const express = require('express');
const router = express.Router();

const emprestimoController = require('../controllers/emprestimoController');


router.get('/listar', emprestimoController.listarEmprestimos);
router.get('/resumo', emprestimoController.resumoEmprestimos);
router.get('/:id', emprestimoController.obterEmprestimo);

router.post('/', emprestimoController.criarEmprestimo);
router.put('/:id', emprestimoController.atualizarEmprestimo);
router.delete('/:id', emprestimoController.deletarEmprestimo);

router.put('/:id/devolver', emprestimoController.devolverEmprestimo);
router.get('/resumo', emprestimoController.resumoEmprestimos);
module.exports = router;