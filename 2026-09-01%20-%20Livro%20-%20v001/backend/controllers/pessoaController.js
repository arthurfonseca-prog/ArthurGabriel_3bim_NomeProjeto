const { query } = require('../database');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ======================================================
// LISTAR PESSOAS
// GET /pessoa/listar
// ======================================================

exports.listarPessoas = async (req, res) => {
    try {

        const result = await query(`
            SELECT *
            FROM pessoa
            ORDER BY id_pessoa
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao listar pessoas:', error);

        res.status(500).json({
            mensagem: 'Erro ao listar pessoas.'
        });
    }
};


// ======================================================
// OBTER UMA PESSOA
// GET /pessoa/:id
// ======================================================

exports.obterPessoa = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da pessoa inválido.'
            });
        }

        const result = await query(`
            SELECT *
            FROM pessoa
            WHERE id_pessoa = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Pessoa não encontrada.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao obter pessoa:', error);

        res.status(500).json({
            mensagem: 'Erro ao buscar pessoa.'
        });
    }
};


// ======================================================
// CRIAR PESSOA
// POST /pessoa
// ======================================================

exports.criarPessoa = async (req, res) => {
    try {

        const {
            id_pessoa,
            nome,
            email,
            telefone
        } = req.body;

        const id = parseInt(id_pessoa, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'Informe um ID inteiro para a pessoa.'
            });
        }

        if (!nome || nome.trim() === '') {
            return res.status(400).json({
                mensagem: 'O nome da pessoa é obrigatório.'
            });
        }

        // Verifica se o ID já existe
        const pessoaExistente = await query(`
            SELECT id_pessoa
            FROM pessoa
            WHERE id_pessoa = $1
        `, [id]);

        if (pessoaExistente.rows.length > 0) {
            return res.status(400).json({
                mensagem: 'Já existe uma pessoa com esse ID.'
            });
        }

        const result = await query(`
            INSERT INTO pessoa (
                id_pessoa,
                nome,
                email,
                telefone
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            id,
            nome.trim(),
            email || null,
            telefone || null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao criar pessoa:', error);

        res.status(500).json({
            mensagem: 'Erro ao criar pessoa.'
        });
    }
};


// ======================================================
// ATUALIZAR PESSOA
// PUT /pessoa/:id
// ======================================================

exports.atualizarPessoa = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da pessoa inválido.'
            });
        }

        const {
            nome,
            email,
            telefone
        } = req.body;

        if (!nome || nome.trim() === '') {
            return res.status(400).json({
                mensagem: 'O nome da pessoa é obrigatório.'
            });
        }

        const result = await query(`
            UPDATE pessoa
            SET
                nome = $1,
                email = $2,
                telefone = $3
            WHERE id_pessoa = $4
            RETURNING *
        `, [
            nome.trim(),
            email || null,
            telefone || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Pessoa não encontrada.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao atualizar pessoa:', error);

        res.status(500).json({
            mensagem: 'Erro ao atualizar pessoa.'
        });
    }
};


// ======================================================
// UPLOAD DA FOTO
// POST /pessoa/upload/:id
// ======================================================

exports.uploadImagem = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da pessoa inválido.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                mensagem: 'Nenhuma imagem foi enviada.'
            });
        }

        // Verifica se a pessoa existe
        const pessoa = await query(`
            SELECT id_pessoa
            FROM pessoa
            WHERE id_pessoa = $1
        `, [id]);

        if (pessoa.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Pessoa não encontrada.'
            });
        }

        // Caminho: projeto/imagens/pessoa
        const pastaImagens = path.join(
            __dirname,
            '../../imagens/pessoa'
        );

        // Cria a pasta caso ela não exista
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, {
                recursive: true
            });
        }

        // Nome baseado no ID da pessoa
        const caminhoDestino = path.join(
            pastaImagens,
            `${id}.png`
        );

        // Processa a imagem
        await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover'
            })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({
            mensagem: 'Imagem salva com sucesso!'
        });

    } catch (error) {

        console.error('Erro ao salvar imagem:', error);

        res.status(500).json({
            mensagem: 'Erro ao processar imagem.'
        });
    }
};


// ======================================================
// DELETAR PESSOA
// DELETE /pessoa/:id
// ======================================================

exports.deletarPessoa = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID da pessoa inválido.'
            });
        }

        const result = await query(`
            DELETE FROM pessoa
            WHERE id_pessoa = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Pessoa não encontrada.'
            });
        }

        // Apaga também a imagem, caso exista
        const caminhoImagem = path.join(
            __dirname,
            '../../imagens/pessoa',
            `${id}.png`
        );

        if (fs.existsSync(caminhoImagem)) {
            fs.unlinkSync(caminhoImagem);
        }

        res.json({
            mensagem: 'Pessoa excluída com sucesso.'
        });

    } catch (error) {

        console.error('Erro ao excluir pessoa:', error);

        // Pessoa possui empréstimos
        if (error.code === '23503') {
            return res.status(400).json({
                mensagem: 'Não é possível excluir esta pessoa porque existem empréstimos associados a ela.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao excluir pessoa.'
        });
    }
};