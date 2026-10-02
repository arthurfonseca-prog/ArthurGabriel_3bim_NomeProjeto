const { query } = require('../database');


// ======================================================
// LISTAR EMPRÉSTIMOS
// ======================================================

exports.listarEmprestimos = async (req, res) => {
    try {

        const resultado = await query(`
            SELECT
                e.id_emprestimo,
                e.id_pessoa,
                e.id_livro,
                e.data_emprestimo,
                e.data_prevista_devolucao,
                e.data_devolucao,
                e.status,

                p.nome AS nome_pessoa,
                l.titulo

            FROM emprestimo e

            INNER JOIN pessoa p
                ON e.id_pessoa = p.id_pessoa

            INNER JOIN livro l
                ON e.id_livro = l.id_livro

            ORDER BY e.id_emprestimo
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(
            'Erro ao listar empréstimos:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao listar empréstimos.',
            detalhes: error.message
        });
    }
};


// ======================================================
// OBTER EMPRÉSTIMO POR ID
// ======================================================

exports.obterEmprestimo = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'O ID do empréstimo precisa ser um número inteiro.'
            });
        }


        const resultado = await query(`
            SELECT
                e.id_emprestimo,
                e.id_pessoa,
                e.id_livro,
                e.data_emprestimo,
                e.data_prevista_devolucao,
                e.data_devolucao,
                e.status,

                p.nome AS nome_pessoa,
                l.titulo

            FROM emprestimo e

            INNER JOIN pessoa p
                ON e.id_pessoa = p.id_pessoa

            INNER JOIN livro l
                ON e.id_livro = l.id_livro

            WHERE e.id_emprestimo = $1
        `, [id]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Empréstimo não encontrado.'
            });
        }


        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(
            'Erro ao buscar empréstimo:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao buscar empréstimo.',
            detalhes: error.message
        });
    }
};


// ======================================================
// CRIAR EMPRÉSTIMO
// ======================================================

exports.criarEmprestimo = async (req, res) => {

    try {

        const {
            id_emprestimo,
            id_pessoa,
            id_livro,
            data_emprestimo,
            data_prevista_devolucao,
            data_devolucao,
            status
        } = req.body;


        // ==============================================
        // VALIDAR ID DO EMPRÉSTIMO
        // ==============================================

        const id = parseInt(
            id_emprestimo,
            10
        );

        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'Informe um ID inteiro para o empréstimo.'
            });
        }


        // ==============================================
        // VALIDAR PESSOA
        // ==============================================

        if (!id_pessoa) {

            return res.status(400).json({
                mensagem: 'Informe a pessoa do empréstimo.'
            });
        }


        // ==============================================
        // VALIDAR LIVRO
        // ==============================================

        if (!id_livro) {

            return res.status(400).json({
                mensagem: 'Informe o livro do empréstimo.'
            });
        }


        // ==============================================
        // VALIDAR DATA DO EMPRÉSTIMO
        // ==============================================

        if (!data_emprestimo) {

            return res.status(400).json({
                mensagem: 'Informe a data do empréstimo.'
            });
        }


        // ==============================================
        // VALIDAR DATA PREVISTA
        // ==============================================

        if (!data_prevista_devolucao) {

            return res.status(400).json({
                mensagem: 'Informe a data prevista para devolução.'
            });
        }


        // ==============================================
        // VERIFICAR ID DUPLICADO
        // ==============================================

        const idExistente = await query(`
            SELECT id_emprestimo
            FROM emprestimo
            WHERE id_emprestimo = $1
        `, [id]);


        if (idExistente.rows.length > 0) {

            return res.status(400).json({
                mensagem: 'Já existe um empréstimo com esse ID.'
            });
        }


        // ==============================================
        // VERIFICAR SE A PESSOA EXISTE
        // ==============================================

        const pessoaExiste = await query(`
            SELECT id_pessoa
            FROM pessoa
            WHERE id_pessoa = $1
        `, [id_pessoa]);


        if (pessoaExiste.rows.length === 0) {

            return res.status(400).json({
                mensagem: 'A pessoa informada não existe.'
            });
        }


        // ==============================================
        // VERIFICAR SE O LIVRO EXISTE
        // ==============================================

        const livroExiste = await query(`
            SELECT id_livro
            FROM livro
            WHERE id_livro = $1
        `, [id_livro]);


        if (livroExiste.rows.length === 0) {

            return res.status(400).json({
                mensagem: 'O livro informado não existe.'
            });
        }


        // ==============================================
        // NOVA REGRA:
        // VERIFICAR SE O LIVRO JÁ ESTÁ EMPRESTADO
        // ==============================================

        const livroEmprestado = await query(`
            SELECT id_emprestimo
            FROM emprestimo
            WHERE id_livro = $1
              AND data_devolucao IS NULL
        `, [id_livro]);


        if (livroEmprestado.rows.length > 0) {

            return res.status(400).json({
                mensagem:
                    'Este livro já está emprestado e ainda não foi devolvido.'
            });
        }


        // ==============================================
        // DEFINIR STATUS
        // ==============================================

        let statusFinal = 'ATIVO';


        if (data_devolucao) {

            statusFinal = 'DEVOLVIDO';

        } else {

            const hoje = new Date();

            hoje.setHours(
                0,
                0,
                0,
                0
            );


            const dataPrevista =
                new Date(data_prevista_devolucao);


            if (dataPrevista < hoje) {

                statusFinal = 'ATRASADO';
            }
        }


        // ==============================================
        // INSERIR
        // ==============================================

        const resultado = await query(`
            INSERT INTO emprestimo (
                id_emprestimo,
                id_pessoa,
                id_livro,
                data_emprestimo,
                data_prevista_devolucao,
                data_devolucao,
                status
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )

            RETURNING *
        `, [
            id,
            id_pessoa,
            id_livro,
            data_emprestimo,
            data_prevista_devolucao,
            data_devolucao || null,
            statusFinal
        ]);


        res.status(201).json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            'Erro ao criar empréstimo:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao criar empréstimo.',
            detalhes: error.message
        });
    }
};


// ======================================================
// ATUALIZAR EMPRÉSTIMO
// ======================================================

exports.atualizarEmprestimo = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'O ID precisa ser um número inteiro.'
            });
        }


        const {
            id_pessoa,
            id_livro,
            data_emprestimo,
            data_prevista_devolucao,
            data_devolucao
        } = req.body;


        if (!id_pessoa || !id_livro) {

            return res.status(400).json({
                mensagem: 'Informe a pessoa e o livro.'
            });
        }


        if (!data_emprestimo) {

            return res.status(400).json({
                mensagem: 'Informe a data do empréstimo.'
            });
        }


        if (!data_prevista_devolucao) {

            return res.status(400).json({
                mensagem: 'Informe a data prevista de devolução.'
            });
        }


        // ==============================================
        // VERIFICAR SE O EMPRÉSTIMO EXISTE
        // ==============================================

        const emprestimoExiste = await query(`
            SELECT id_emprestimo
            FROM emprestimo
            WHERE id_emprestimo = $1
        `, [id]);


        if (emprestimoExiste.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Empréstimo não encontrado.'
            });
        }


        // ==============================================
        // VERIFICAR SE O LIVRO EXISTE
        // ==============================================

        const livroExiste = await query(`
            SELECT id_livro
            FROM livro
            WHERE id_livro = $1
        `, [id_livro]);


        if (livroExiste.rows.length === 0) {

            return res.status(400).json({
                mensagem: 'O livro informado não existe.'
            });
        }


        // ==============================================
        // VERIFICAR SE A PESSOA EXISTE
        // ==============================================

        const pessoaExiste = await query(`
            SELECT id_pessoa
            FROM pessoa
            WHERE id_pessoa = $1
        `, [id_pessoa]);


        if (pessoaExiste.rows.length === 0) {

            return res.status(400).json({
                mensagem: 'A pessoa informada não existe.'
            });
        }


        // ==============================================
        // VERIFICAR SE OUTRO EMPRÉSTIMO
        // JÁ ESTÁ USANDO ESSE LIVRO
        //
        // O próprio empréstimo atual é excluído
        // da verificação pelo id_emprestimo.
        // ==============================================

        const livroEmprestado = await query(`
            SELECT id_emprestimo
            FROM emprestimo
            WHERE id_livro = $1
              AND data_devolucao IS NULL
              AND id_emprestimo <> $2
        `, [
            id_livro,
            id
        ]);


        if (livroEmprestado.rows.length > 0) {

            return res.status(400).json({
                mensagem:
                    'Este livro já está emprestado em outro empréstimo e ainda não foi devolvido.'
            });
        }


        // ==============================================
        // DEFINIR STATUS
        // ==============================================

        let statusFinal = 'ATIVO';


        if (data_devolucao) {

            statusFinal = 'DEVOLVIDO';

        } else {

            const hoje = new Date();

            hoje.setHours(
                0,
                0,
                0,
                0
            );


            const dataPrevista =
                new Date(data_prevista_devolucao);


            if (dataPrevista < hoje) {

                statusFinal = 'ATRASADO';
            }
        }


        // ==============================================
        // ATUALIZAR
        // ==============================================

        const resultado = await query(`
            UPDATE emprestimo

            SET
                id_pessoa = $1,
                id_livro = $2,
                data_emprestimo = $3,
                data_prevista_devolucao = $4,
                data_devolucao = $5,
                status = $6

            WHERE id_emprestimo = $7

            RETURNING *
        `, [
            id_pessoa,
            id_livro,
            data_emprestimo,
            data_prevista_devolucao,
            data_devolucao || null,
            statusFinal,
            id
        ]);


        res.json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            'Erro ao atualizar empréstimo:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao atualizar empréstimo.',
            detalhes: error.message
        });
    }
};


// ======================================================
// DEVOLVER EMPRÉSTIMO
// ======================================================

exports.devolverEmprestimo = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'O ID precisa ser um número inteiro.'
            });
        }


        const dataDevolucao =
            req.body.data_devolucao ||
            new Date().toISOString().split('T')[0];


        const resultado = await query(`
            UPDATE emprestimo

            SET
                data_devolucao = $1,
                status = 'DEVOLVIDO'

            WHERE id_emprestimo = $2

            RETURNING *
        `, [
            dataDevolucao,
            id
        ]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Empréstimo não encontrado.'
            });
        }


        res.json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            'Erro ao registrar devolução:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao registrar devolução.',
            detalhes: error.message
        });
    }
};


// ======================================================
// EXCLUIR EMPRÉSTIMO
// ======================================================

exports.deletarEmprestimo = async (req, res) => {

    try {

        const id = parseInt(
            req.params.id,
            10
        );


        if (isNaN(id)) {

            return res.status(400).json({
                mensagem: 'O ID precisa ser um número inteiro.'
            });
        }


        const resultado = await query(`
            DELETE FROM emprestimo
            WHERE id_emprestimo = $1
            RETURNING *
        `, [id]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensagem: 'Empréstimo não encontrado.'
            });
        }


        res.json({
            mensagem: 'Empréstimo excluído com sucesso.',
            emprestimo: resultado.rows[0]
        });


    } catch (error) {

        console.error(
            'Erro ao excluir empréstimo:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao excluir empréstimo.',
            detalhes: error.message
        });
    }
};


// ======================================================
// RESUMO / DASHBOARD
// ======================================================

exports.resumoEmprestimos = async (req, res) => {

    try {

        const resultado = await query(`
            SELECT

                COUNT(*) FILTER (
                    WHERE data_devolucao IS NULL
                ) AS total_emprestados,

                COUNT(DISTINCT id_pessoa) FILTER (
                    WHERE data_devolucao IS NULL
                ) AS total_pessoas,

                COUNT(*) FILTER (
                    WHERE data_devolucao IS NULL
                    AND data_prevista_devolucao < CURRENT_DATE
                ) AS total_atrasados,

                COUNT(*) FILTER (
                    WHERE data_devolucao IS NOT NULL
                ) AS total_devolvidos

            FROM emprestimo
        `);


        res.json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            'Erro ao carregar resumo:',
            error
        );

        res.status(500).json({
            mensagem: 'Erro ao carregar resumo.',
            detalhes: error.message
        });
    }
};