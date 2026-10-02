const { query } = require('../database');


// ======================================================
// LISTAR GÊNEROS
// GET /genero/listar
// ======================================================

exports.listarGeneros = async (req, res) => {
    try {

        const result = await query(`
            SELECT *
            FROM genero
            ORDER BY id_genero
        `);

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao listar gêneros:', error);

        res.status(500).json({
            mensagem: 'Erro ao listar gêneros.'
        });
    }
};


// ======================================================
// OBTER UM GÊNERO
// GET /genero/:id
// ======================================================

exports.obterGenero = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do gênero inválido.'
            });
        }

        const result = await query(`
            SELECT *
            FROM genero
            WHERE id_genero = $1
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Gênero não encontrado.'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao obter gênero:', error);

        res.status(500).json({
            mensagem: 'Erro ao buscar gênero.'
        });
    }
};


// ======================================================
// CRIAR GÊNERO
// POST /genero
// ======================================================

exports.criarGenero = async (req, res) => {
    try {

        const {
            id_genero,
            nome,
            descricao
        } = req.body;


        // ----------------------------------------------
        // VALIDAR ID
        // ----------------------------------------------

        const id = parseInt(id_genero, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'Informe um ID inteiro para o gênero.'
            });
        }


        // ----------------------------------------------
        // VALIDAR NOME
        // ----------------------------------------------

        if (!nome || nome.trim() === '') {

            return res.status(400).json({
                mensagem: 'O nome do gênero é obrigatório.'
            });
        }


        // ----------------------------------------------
        // VERIFICAR SE O ID JÁ EXISTE
        // ----------------------------------------------

        const generoExistente = await query(`
            SELECT id_genero
            FROM genero
            WHERE id_genero = $1
        `, [id]);


        if (generoExistente.rows.length > 0) {

            return res.status(400).json({
                mensagem: 'Já existe um gênero com esse ID.'
            });
        }


        // ----------------------------------------------
        // INSERIR
        // ----------------------------------------------

        const result = await query(`
            INSERT INTO genero (
                id_genero,
                nome,
                descricao
            )
            VALUES ($1, $2, $3)
            RETURNING *
        `, [
            id,
            nome.trim(),
            descricao || null
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao criar gênero:', error);

        res.status(500).json({
            mensagem: 'Erro ao criar gênero.',
            detalhes: error.message
        });
    }
};


// ======================================================
// ATUALIZAR GÊNERO
// PUT /genero/:id
// ======================================================

exports.atualizarGenero = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do gênero inválido.'
            });
        }


        const {
            nome,
            descricao
        } = req.body;


        // ----------------------------------------------
        // VALIDAR NOME
        // ----------------------------------------------

        if (!nome || nome.trim() === '') {

            return res.status(400).json({
                mensagem: 'O nome do gênero é obrigatório.'
            });
        }


        // ----------------------------------------------
        // ATUALIZAR
        // ----------------------------------------------

        const result = await query(`
            UPDATE genero
            SET
                nome = $1,
                descricao = $2
            WHERE id_genero = $3
            RETURNING *
        `, [
            nome.trim(),
            descricao || null,
            id
        ]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Gênero não encontrado.'
            });
        }


        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao atualizar gênero:', error);

        res.status(500).json({
            mensagem: 'Erro ao atualizar gênero.'
        });
    }
};


// ======================================================
// DELETAR GÊNERO
// DELETE /genero/:id
// ======================================================

exports.deletarGenero = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'ID do gênero inválido.'
            });
        }


        const result = await query(`
            DELETE FROM genero
            WHERE id_genero = $1
            RETURNING *
        `, [id]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Gênero não encontrado.'
            });
        }


        res.json({
            mensagem: 'Gênero excluído com sucesso.'
        });

    } catch (error) {

        console.error('Erro ao excluir gênero:', error);


        // ----------------------------------------------
        // GÊNERO SENDO USADO POR LIVRO
        // ----------------------------------------------

        if (error.code === '23503') {

            return res.status(400).json({
                mensagem:
                    'Não é possível excluir este gênero porque existem livros associados a ele.'
            });
        }


        res.status(500).json({
            mensagem: 'Erro ao excluir gênero.'
        });
    }
};