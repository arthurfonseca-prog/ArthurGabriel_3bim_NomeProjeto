const { query } = require('../database');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ========================================
// LISTAR AUTORES
// ========================================

exports.listarAutores = async (req, res) => {

    try {

        const result = await query(
            'SELECT * FROM autor ORDER BY id_autor'
        );

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao listar autores:', error);

        res.status(500).json({
            mensagem: 'Erro ao listar autores.'
        });
    }
};


// ========================================
// OBTER AUTOR
// ========================================

exports.obterAutor = async (req, res) => {

    try {

        const id = parseInt(req.params.id, 10);


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }


        const result = await query(
            'SELECT * FROM autor WHERE id_autor = $1',
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Autor não encontrado.'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao obter autor:', error);

        res.status(500).json({
            mensagem: 'Erro ao buscar autor.'
        });
    }
};


// ========================================
// CRIAR AUTOR
exports.criarAutor = async (req, res) => {

    try {

        const {
            id_autor,
            nome,
            biografia
        } = req.body;


        // ========================================
        // VALIDAR ID
        // ========================================

        const id = parseInt(id_autor, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'Informe um ID inteiro para o autor.'
            });
        }


        // ========================================
        // VALIDAR NOME
        // ========================================

        if (!nome || nome.trim() === '') {

            return res.status(400).json({
                mensagem: 'O nome do autor é obrigatório.'
            });
        }


        // ========================================
        // VERIFICAR SE ID JÁ EXISTE
        // ========================================

        const autorExistente = await query(
            `
            SELECT id_autor
            FROM autor
            WHERE id_autor = $1
            `,
            [id]
        );


        if (autorExistente.rows.length > 0) {

            return res.status(400).json({
                mensagem: 'Já existe um autor com esse ID.'
            });
        }


        // ========================================
        // INSERIR
        // ========================================

        const resultado = await query(
            `
            INSERT INTO autor (
                id_autor,
                nome,
                biografia
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                id,
                nome.trim(),
                biografia || null
            ]
        );


        res.status(201).json(resultado.rows[0]);


    } catch (error) {

        console.error(
            'Erro ao criar autor:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao criar autor.',
            detalhes: error.message
        });
    }
}

exports.atualizarAutor = async (req, res) => {

    try {

        const id = parseInt(req.params.id, 10);

        const {
            nome,
            biografia
        } = req.body;


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }


        if (!nome || nome.trim() === '') {

            return res.status(400).json({
                mensagem: 'O nome do autor é obrigatório.'
            });
        }


        const result = await query(
            `
            UPDATE autor
            SET
                nome = $1,
                biografia = $2
            WHERE id_autor = $3
            RETURNING *
            `,
            [
                nome.trim(),
                biografia || null,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Autor não encontrado.'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao atualizar autor:', error);

        res.status(500).json({
            mensagem: 'Erro ao atualizar autor.'
        });
    }
};


// ========================================
// UPLOAD DA IMAGEM
// ========================================

exports.uploadImagem = async (req, res) => {

    try {

        const id = parseInt(req.params.id, 10);


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }


        if (!req.file) {

            return res.status(400).json({
                mensagem: 'Nenhuma imagem foi enviada.'
            });
        }


        // Verifica se o autor existe.

        const autor = await query(
            'SELECT id_autor FROM autor WHERE id_autor = $1',
            [id]
        );


        if (autor.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Autor não encontrado.'
            });
        }


        // Pasta: imagens/autores

        const pastaImagens = path.join(
            __dirname,
            '../../imagens/autores'
        );


        if (!fs.existsSync(pastaImagens)) {

            fs.mkdirSync(
                pastaImagens,
                {
                    recursive: true
                }
            );
        }


        // Arquivo físico:
        // imagens/autores/1.png

        const caminhoDestino = path.join(
            pastaImagens,
            `${id}.png`
        );


        // Processa a imagem com Sharp.

        await sharp(req.file.buffer)
            .resize(
                300,
                300,
                {
                    fit: 'cover'
                }
            )
            .png()
            .toFile(caminhoDestino);


        // Caminho armazenado no PostgreSQL.

        const caminhoBanco =
            `imagens/autores/${id}.png`;


        await query(
            `
            UPDATE autor
            SET foto = $1
            WHERE id_autor = $2
            `,
            [
                caminhoBanco,
                id
            ]
        );


        res.json({

            mensagem:
                'Imagem salva com sucesso.',

            foto:
                caminhoBanco
        });


    } catch (error) {

        console.error(
            'Erro ao salvar imagem do autor:',
            error
        );


        res.status(500).json({

            mensagem:
                'Erro ao processar e salvar a imagem.'
        });
    }
};


// ========================================
// DELETAR AUTOR
// ========================================

exports.deletarAutor = async (req, res) => {

    try {

        const id = parseInt(req.params.id, 10);


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }


        const result = await query(
            `
            DELETE FROM autor
            WHERE id_autor = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Autor não encontrado.'
            });
        }


        // Remove a imagem física, se existir.

        const caminhoImagem = path.join(
            __dirname,
            '../../imagens/autores',
            `${id}.png`
        );


        if (fs.existsSync(caminhoImagem)) {

            fs.unlinkSync(caminhoImagem);
        }


        res.json({

            mensagem:
                'Autor excluído com sucesso.'
        });


    } catch (error) {

        console.error(
            'Erro ao excluir autor:',
            error
        );


        res.status(500).json({

            mensagem:
                'Erro ao excluir autor.'
        });
    }
};