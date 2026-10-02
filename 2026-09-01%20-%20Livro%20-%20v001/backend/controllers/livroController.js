const { query } = require('../database');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ======================================================
// LISTAR LIVROS
// ======================================================

exports.listarLivros = async (req, res) => {

    try {

        const resultado = await query(`
            SELECT *
            FROM livro
            ORDER BY id_livro
        `);

        res.json(resultado.rows);

    } catch (erro) {

        console.error(
            'Erro ao listar livros:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao listar livros.'
        });
    }
};


// ======================================================
// PROCURAR LIVRO POR ID
// ======================================================

exports.obterLivro = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do livro inválido.'
            });
        }


        const resultado = await query(`
            SELECT *
            FROM livro
            WHERE id_livro = $1
        `, [id]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Livro não encontrado.'
            });
        }


        res.json(resultado.rows[0]);

    } catch (erro) {

        console.error(
            'Erro ao buscar livro:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao buscar livro.'
        });
    }
};


// ======================================================
// CADASTRAR LIVRO
// ======================================================

exports.criarLivro = async (req, res) => {

    try {

        const {
            id_livro,
            titulo,
            ano_publicacao,
            sinopse,
            id_editora,
            id_genero
        } = req.body;


        const resultado = await query(`
            INSERT INTO livro (
                id_livro,
                titulo,
                ano_publicacao,
                sinopse,
                id_editora,
                id_genero
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            RETURNING *
        `, [
            id_livro,
            titulo,
            ano_publicacao,
            sinopse,
            id_editora,
            id_genero
        ]);


        res.status(201).json(
            resultado.rows[0]
        );

    } catch (erro) {

        console.error(
            'Erro ao cadastrar livro:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao cadastrar livro.'
        });
    }
};


// ======================================================
// ALTERAR LIVRO
// ======================================================

exports.atualizarLivro = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do livro inválido.'
            });
        }


        const {
            titulo,
            ano_publicacao,
            sinopse,
            id_editora,
            id_genero
        } = req.body;


        const resultado = await query(`
            UPDATE livro
            SET
                titulo = $1,
                ano_publicacao = $2,
                sinopse = $3,
                id_editora = $4,
                id_genero = $5
            WHERE id_livro = $6
            RETURNING *
        `, [
            titulo,
            ano_publicacao,
            sinopse,
            id_editora,
            id_genero,
            id
        ]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Livro não encontrado.'
            });
        }


        res.json(
            resultado.rows[0]
        );

    } catch (erro) {

        console.error(
            'Erro ao atualizar livro:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao atualizar livro.'
        });
    }
};


// ======================================================
// EXCLUIR LIVRO
// ======================================================

exports.deletarLivro = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do livro inválido.'
            });
        }


        const resultado = await query(`
            DELETE FROM livro
            WHERE id_livro = $1
            RETURNING *
        `, [id]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Livro não encontrado.'
            });
        }


        res.json({
            mensagem: 'Livro excluído com sucesso.'
        });

    } catch (erro) {

        console.error(
            'Erro ao excluir livro:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao excluir livro.'
        });
    }
};


// ======================================================
// UPLOAD DA IMAGEM
// ======================================================

// ======================================================
// UPLOAD DA IMAGEM
// ======================================================

exports.uploadImagem = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do livro inválido.'
            });
        }


        if (!req.file) {

            return res.status(400).json({
                mensagem: 'Nenhuma imagem foi enviada.'
            });
        }


        // ==================================================
        // VERIFICAR SE O LIVRO EXISTE
        // ==================================================

        const livro = await query(`
            SELECT *
            FROM livro
            WHERE id_livro = $1
        `, [id]);


        if (livro.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Livro não encontrado.'
            });
        }


        // ==================================================
        // PASTA DE IMAGENS DOS LIVROS
        // ==================================================

        const pastaImagens = path.join(
            __dirname,
            '../../imagens/livros'
        );


        if (!fs.existsSync(pastaImagens)) {

            fs.mkdirSync(
                pastaImagens,
                {
                    recursive: true
                }
            );
        }


        // ==================================================
        // CAMINHO DA IMAGEM
        // ==================================================

        const caminhoArquivo = path.join(
            pastaImagens,
            `${id}.png`
        );


        // ==================================================
        // PROCESSAR IMAGEM COM SHARP
        // ==================================================

        await sharp(req.file.buffer)
            .resize(
                300,
                300,
                {
                    fit: 'cover'
                }
            )
            .png()
            .toFile(caminhoArquivo);


        // ==================================================
        // SALVAR CAMINHO NO BANCO
        // ==================================================

        const caminhoBanco =
            `imagens/livros/${id}.png`;


        await query(`
            UPDATE livro
            SET imagem = $1
            WHERE id_livro = $2
        `, [
            caminhoBanco,
            id
        ]);


        // ==================================================
        // RESPOSTA
        // ==================================================

        res.json({

            mensagem:
                'Imagem enviada com sucesso!',

            caminho:
                caminhoBanco

        });


    } catch (erro) {

        console.error(
            'Erro ao fazer upload da imagem:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao processar a imagem.'
        });
    }
};