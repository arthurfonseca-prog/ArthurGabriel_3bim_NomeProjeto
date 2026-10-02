const express = require('express');
const router = express.Router();

const generoController = require('../controllers/generoController');

router.get('/listar', generoController.listarGeneros);
router.get('/:id', generoController.obterGenero);
router.post('/', generoController.criarGenero);
router.put('/:id', generoController.atualizarGenero);
router.delete('/:id', generoController.deletarGenero);

module.exports = router;