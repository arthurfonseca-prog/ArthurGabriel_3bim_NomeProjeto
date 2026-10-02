const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ======================================================
// LISTAR EDITORAS
// GET /editora/listar
// ======================================================

exports.listarEditoras = async (req, res) => {
    try {

        const result = await query(`
            SELECT *
            FROM editora
            ORDER BY id_editora
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao listar editoras:', error);

        res.status(500).json({
            mensagem: 'Erro ao listar editoras.'
        });
    }
};


// ======================================================
// OBTER UMA EDITORA
// GET /editora/:id
// ======================================================

exports.obterEditora = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da editora inválido.'
            });
        }

        const result = await query(`
            SELECT *
            FROM editora
            WHERE id_editora = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Editora não encontrada.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao obter editora:', error);

        res.status(500).json({
            mensagem: 'Erro ao buscar editora.'
        });
    }
};


// ======================================================
// CRIAR EDITORA
// POST /editora
// ======================================================

exports.criarEditora = async (req, res) => {
    try {

        const {
            id_editora,
            nome,
            pais,
            site
        } = req.body;

        const id = parseInt(id_editora, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'Informe um ID inteiro para a editora.'
            });
        }

        if (!nome || nome.trim() === '') {
            return res.status(400).json({
                mensagem: 'O nome da editora é obrigatório.'
            });
        }

        // Verifica se o ID já existe
        const existente = await query(`
            SELECT id_editora
            FROM editora
            WHERE id_editora = $1
        `, [id]);

        if (existente.rows.length > 0) {
            return res.status(400).json({
                mensagem: 'Já existe uma editora com esse ID.'
            });
        }

        const result = await query(`
            INSERT INTO editora (
                id_editora,
                nome,
                pais,
                site
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            id,
            nome.trim(),
            pais || null,
            site || null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao criar editora:', error);

        res.status(500).json({
            mensagem: 'Erro ao criar editora.'
        });
    }
};


// ======================================================
// ATUALIZAR EDITORA
// PUT /editora/:id
// ======================================================

exports.atualizarEditora = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da editora inválido.'
            });
        }

        const {
            nome,
            pais,
            site
        } = req.body;

        if (!nome || nome.trim() === '') {
            return res.status(400).json({
                mensagem: 'O nome da editora é obrigatório.'
            });
        }

        const result = await query(`
            UPDATE editora
            SET
                nome = $1,
                pais = $2,
                site = $3
            WHERE id_editora = $4
            RETURNING *
        `, [
            nome.trim(),
            pais || null,
            site || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Editora não encontrada.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao atualizar editora:', error);

        res.status(500).json({
            mensagem: 'Erro ao atualizar editora.'
        });
    }
};


// ======================================================
// UPLOAD DA LOGO
// POST /editora/upload/:id
// ======================================================

exports.uploadImagem = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da editora inválido.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                mensagem: 'Nenhuma imagem foi enviada.'
            });
        }

        // Verifica se a editora existe
        const editora = await query(`
            SELECT id_editora
            FROM editora
            WHERE id_editora = $1
        `, [id]);

        if (editora.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Editora não encontrada.'
            });
        }

        // Pasta: projeto/imagens/editoras
        const pastaImagens = path.join(
            __dirname,
            '../../imagens/editoras'
        );

        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, {
                recursive: true
            });
        }

        const nomeArquivo = `${id}.png`;

        const caminhoDestino = path.join(
            pastaImagens,
            nomeArquivo
        );

        // Processa a imagem
        await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover'
            })
            .png()
            .toFile(caminhoDestino);

        // Caminho armazenado no banco
        const caminhoBanco =
            `imagens/editoras/${nomeArquivo}`;

        await query(`
            UPDATE editora
            SET logo = $1
            WHERE id_editora = $2
        `, [
            caminhoBanco,
            id
        ]);

        res.json({
            mensagem: 'Logo salva com sucesso.',
            logo: caminhoBanco
        });

    } catch (error) {

        console.error('Erro ao salvar logo:', error);

        res.status(500).json({
            mensagem: 'Erro ao processar a logo.'
        });
    }
};


// ======================================================
// DELETAR EDITORA
// DELETE /editora/:id
// ======================================================

exports.deletarEditora = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da editora inválido.'
            });
        }

        const result = await query(`
            DELETE FROM editora
            WHERE id_editora = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Editora não encontrada.'
            });
        }

        // Apaga a imagem correspondente
        const caminhoImagem = path.join(
            __dirname,
            '../../imagens/editoras',
            `${id}.png`
        );

        if (fs.existsSync(caminhoImagem)) {
            fs.unlinkSync(caminhoImagem);
        }

        res.json({
            mensagem: 'Editora excluída com sucesso.'
        });

    } catch (error) {

        console.error('Erro ao excluir editora:', error);

        // FK
        if (error.code === '23503') {
            return res.status(400).json({
                mensagem:
                    'Não é possível excluir esta editora porque existem livros vinculados a ela.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao excluir editora.'
        });
    }
};