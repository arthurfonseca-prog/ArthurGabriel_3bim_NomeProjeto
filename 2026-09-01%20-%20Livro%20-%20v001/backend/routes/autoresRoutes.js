const express = require('express');
const multer = require('multer');

const router = express.Router();

const autoresController =
    require('../controllers/autoresController');

const upload = multer({
    storage: multer.memoryStorage()
});


router.get(
    '/listar',
    autoresController.listarAutores
);

router.get(
    '/:id',
    autoresController.obterAutor
);

router.post(
    '/',
    autoresController.criarAutor
);

router.put(
    '/:id',
    autoresController.atualizarAutor
);

router.delete(
    '/:id',
    autoresController.deletarAutor
);


router.post(
    '/upload/:id',
    upload.single('imagem'),
    autoresController.uploadImagem
);


module.exports = router;