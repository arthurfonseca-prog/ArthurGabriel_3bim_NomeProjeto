const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';


// ======================================================
// INICIALIZAÇÃO
// ======================================================

function inicializar() {

    listarEmprestimos();
    carregarResumo();
    carregarPessoas();
    carregarLivros();

    limparCampos();

    mostrarAviso(
        'Informe o ID do empréstimo e clique em Procurar.'
    );
}


// ======================================================
// LISTAR EMPRÉSTIMOS
// ======================================================

async function listarEmprestimos() {

    try {

        const resposta = await fetch(
            `${URL_API}/emprestimo/listar`
        );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar os empréstimos.'
            );
        }

        const emprestimos = await resposta.json();

        mostrarEmprestimos(emprestimos);

    } catch (erro) {

        console.error(
            'Erro ao listar empréstimos:',
            erro
        );

        document.getElementById(
            'outputSaida'
        ).innerHTML =
            '<p>Não foi possível carregar os empréstimos.</p>';
    }
}


// ======================================================
// MOSTRAR EMPRÉSTIMOS
// ======================================================

function mostrarEmprestimos(emprestimos) {

    const lista =
        document.getElementById('outputSaida');

    lista.innerHTML = '';

    if (emprestimos.length === 0) {

        lista.innerHTML =
            '<p>Nenhum empréstimo cadastrado.</p>';

        return;
    }

    emprestimos.forEach(emprestimo => {

        const card =
            document.createElement('article');

        card.classList.add(
            'card-emprestimo'
        );

        const dataEmprestimo =
            formatarData(
                emprestimo.data_emprestimo
            );

        const dataPrevista =
            formatarData(
                emprestimo.data_prevista_devolucao
            );

        const dataDevolucao =
            emprestimo.data_devolucao
                ? formatarData(
                    emprestimo.data_devolucao
                )
                : 'Ainda não devolvido';


        let status = 'ATIVO';


        if (emprestimo.data_devolucao) {

            status = 'DEVOLVIDO';

        } else {

            const hoje = new Date();

            hoje.setHours(
                0,
                0,
                0,
                0
            );

            const dataPrevistaObj =
                new Date(
                    emprestimo.data_prevista_devolucao
                );

            if (dataPrevistaObj < hoje) {
                status = 'ATRASADO';
            }
        }


        card.innerHTML = `

            <h3>
                ${emprestimo.titulo || 'Livro não encontrado'}
            </h3>

            <p>
                <strong>Pessoa:</strong>
                ${emprestimo.nome_pessoa || 'Não informado'}
            </p>

            <p>
                <strong>Empréstimo:</strong>
                ${dataEmprestimo}
            </p>

            <p>
                <strong>Devolução prevista:</strong>
                ${dataPrevista}
            </p>

            <p>
                <strong>Devolução:</strong>
                ${dataDevolucao}
            </p>

            <p>
                <strong>Status:</strong>
                ${status}
            </p>

            <div class="botoes-card">

                ${
                    !emprestimo.data_devolucao
                        ? `
                            <button
                                type="button"
                                onclick="devolverEmprestimo(${emprestimo.id_emprestimo})"
                            >
                                Devolver
                            </button>
                        `
                        : ''
                }

                <button
                    type="button"
                    onclick="procurar(${emprestimo.id_emprestimo})"
                >
                    Editar
                </button>

                <button
                    type="button"
                    onclick="excluirDireto(${emprestimo.id_emprestimo})"
                >
                    Excluir
                </button>

            </div>
        `;

        lista.appendChild(card);
    });
}


// ======================================================
// RESUMO
// ======================================================

async function carregarResumo() {

    try {

        const resposta =
            await fetch(
                `${URL_API}/emprestimo/resumo`
            );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao carregar resumo.'
            );
        }

        const resumo =
            await resposta.json();


        document.getElementById(
            'totalEmprestados'
        ).textContent =
            resumo.total_emprestados ?? 0;


        document.getElementById(
            'totalPessoas'
        ).textContent =
            resumo.total_pessoas ?? 0;


        document.getElementById(
            'totalAtrasados'
        ).textContent =
            resumo.total_atrasados ?? 0;


        document.getElementById(
            'totalDevolvidos'
        ).textContent =
            resumo.total_devolvidos ?? 0;


    } catch (erro) {

        console.error(
            'Erro ao carregar resumo:',
            erro
        );
    }
}


// ======================================================
// CARREGAR PESSOAS
// ======================================================

async function carregarPessoas() {

    try {

        const resposta =
            await fetch(
                `${URL_API}/pessoa/listar`
            );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar pessoas.'
            );
        }

        const pessoas =
            await resposta.json();


        const select =
            document.getElementById(
                'selectId_pessoa'
            );


        select.innerHTML =
            '<option value="">Selecione uma pessoa</option>';


        pessoas.forEach(pessoa => {

            const option =
                document.createElement('option');

            option.value =
                pessoa.id_pessoa;

            option.textContent =
                `${pessoa.nome} (ID: ${pessoa.id_pessoa})`;

            select.appendChild(option);
        });


    } catch (erro) {

        console.error(
            'Erro ao carregar pessoas:',
            erro
        );
    }
}


// ======================================================
// CARREGAR LIVROS
// ======================================================

async function carregarLivros() {

    try {

        const resposta =
            await fetch(
                `${URL_API}/livro/listar`
            );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar livros.'
            );
        }

        const livros =
            await resposta.json();


        const select =
            document.getElementById(
                'selectId_livro'
            );


        select.innerHTML =
            '<option value="">Selecione um livro</option>';


        livros.forEach(livro => {

            const option =
                document.createElement('option');

            option.value =
                livro.id_livro;

            option.textContent =
                `${livro.titulo} (ID: ${livro.id_livro})`;

            select.appendChild(option);
        });


    } catch (erro) {

        console.error(
            'Erro ao carregar livros:',
            erro
        );
    }
}


// ======================================================
// PROCURAR
// ======================================================

async function procurar(id = null) {

    if (id === null) {

        id =
            document.getElementById(
                'inputId_emprestimo'
            ).value.trim();
    }


    if (!id) {

        mostrarAviso(
            'Digite o ID do empréstimo.'
        );

        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/emprestimo/${id}`
            );


        // ----------------------------------------------
        // NÃO ENCONTROU
        // ----------------------------------------------

        if (resposta.status === 404) {

            limparCamposDados();

            document.getElementById(
                'inputId_emprestimo'
            ).value = id;


            // ID continua liberado
            document.getElementById(
                'inputId_emprestimo'
            ).readOnly = false;


            // Demais campos bloqueados
            bloquearCamposDados(true);


            visibilidadeDosBotoes(
                'inline',
                'inline',
                'none',
                'none',
                'none'
            );


            mostrarAviso(
                'Empréstimo não encontrado. Clique em Inserir para cadastrar.'
            );

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                'Erro ao procurar empréstimo.'
            );
        }


        const emprestimo =
            await resposta.json();


        preencherCampos(
            emprestimo
        );


        bloquearCamposDados(true);


        document.getElementById(
            'inputId_emprestimo'
        ).readOnly = true;


        visibilidadeDosBotoes(
            'inline',
            'none',
            'inline',
            'inline',
            'none'
        );


        oQueEstaFazendo = '';


        mostrarAviso(
            'Empréstimo encontrado.'
        );


    } catch (erro) {

        console.error(
            'Erro ao procurar empréstimo:',
            erro
        );

        mostrarAviso(
            'Erro ao conectar com o servidor.'
        );
    }
}


// ======================================================
// PREENCHER CAMPOS
// ======================================================

function preencherCampos(emprestimo) {

    document.getElementById(
        'inputId_emprestimo'
    ).value =
        emprestimo.id_emprestimo;


    document.getElementById(
        'selectId_pessoa'
    ).value =
        emprestimo.id_pessoa;


    document.getElementById(
        'selectId_livro'
    ).value =
        emprestimo.id_livro;


    document.getElementById(
        'inputData_emprestimo'
    ).value =
        formatarDataInput(
            emprestimo.data_emprestimo
        );


    document.getElementById(
        'inputData_prevista_devolucao'
    ).value =
        formatarDataInput(
            emprestimo.data_prevista_devolucao
        );


    document.getElementById(
        'inputData_devolucao'
    ).value =
        emprestimo.data_devolucao
            ? formatarDataInput(
                emprestimo.data_devolucao
            )
            : '';


    document.getElementById(
        'selectStatus'
    ).value =
        calcularStatus(emprestimo);
}


// ======================================================
// CALCULAR STATUS
// ======================================================

function calcularStatus(emprestimo) {

    if (emprestimo.data_devolucao) {
        return 'DEVOLVIDO';
    }


    const hoje = new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );


    const dataPrevista =
        new Date(
            emprestimo.data_prevista_devolucao
        );


    if (dataPrevista < hoje) {
        return 'ATRASADO';
    }


    return 'ATIVO';
}


// ======================================================
// INSERIR
// ======================================================

function inserir() {

    oQueEstaFazendo =
        'inserindo';


    const id =
        document.getElementById(
            'inputId_emprestimo'
        ).value;


    limparCamposDados();


    document.getElementById(
        'inputId_emprestimo'
    ).value = id;


    // Libera todos os campos
    bloquearCamposDados(false);


    // ID também pode ser digitado
    document.getElementById(
        'inputId_emprestimo'
    ).readOnly = false;


    document.getElementById(
        'selectStatus'
    ).value = 'ATIVO';


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'INSERINDO - Preencha os dados do empréstimo e clique em Salvar.'
    );


    document.getElementById(
        'selectId_pessoa'
    ).focus();
}


// ======================================================
// ALTERAR
// ======================================================

function alterar() {

    const id =
        document.getElementById(
            'inputId_emprestimo'
        ).value;


    if (!id) {

        mostrarAviso(
            'Primeiro procure um empréstimo.'
        );

        return;
    }


    oQueEstaFazendo =
        'alterando';


    // Libera os campos de dados
    bloquearCamposDados(false);


    // ID não pode ser alterado
    document.getElementById(
        'inputId_emprestimo'
    ).readOnly = true;


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'ALTERANDO - Modifique os dados e clique em Salvar.'
    );
}


// ======================================================
// EXCLUIR
// ======================================================

function excluir() {

    const id =
        document.getElementById(
            'inputId_emprestimo'
        ).value;


    if (!id) {

        mostrarAviso(
            'Primeiro procure um empréstimo.'
        );

        return;
    }


    excluirDireto(id);
}


// ======================================================
// EXCLUIR DIRETO
// ======================================================

async function excluirDireto(id) {

    const confirmar =
        confirm(
            'Tem certeza que deseja excluir este empréstimo?'
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/emprestimo/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao excluir empréstimo.'
            );
        }


        mostrarAviso(
            'Empréstimo excluído com sucesso.'
        );


        limparCampos();

        await listarEmprestimos();

        await carregarResumo();


    } catch (erro) {

        console.error(
            'Erro ao excluir:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ======================================================
// SALVAR
// ======================================================

async function salvar() {

    const id =
        document.getElementById(
            'inputId_emprestimo'
        ).value.trim();


    const idPessoa =
        document.getElementById(
            'selectId_pessoa'
        ).value;


    const idLivro =
        document.getElementById(
            'selectId_livro'
        ).value;


    const dataEmprestimo =
        document.getElementById(
            'inputData_emprestimo'
        ).value;


    const dataPrevista =
        document.getElementById(
            'inputData_prevista_devolucao'
        ).value;


    const dataDevolucao =
        document.getElementById(
            'inputData_devolucao'
        ).value;


    // ----------------------------------------------
    // VALIDAÇÕES
    // ----------------------------------------------

    if (!id) {

        mostrarAviso(
            'Informe o ID do empréstimo.'
        );

        return;
    }


    if (
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            'O ID precisa ser um número inteiro.'
        );

        return;
    }


    if (!idPessoa) {

        mostrarAviso(
            'Selecione uma pessoa.'
        );

        return;
    }


    if (!idLivro) {

        mostrarAviso(
            'Selecione um livro.'
        );

        return;
    }


    if (!dataEmprestimo) {

        mostrarAviso(
            'Informe a data do empréstimo.'
        );

        return;
    }


    if (!dataPrevista) {

        mostrarAviso(
            'Informe a data prevista de devolução.'
        );

        return;
    }


    // ----------------------------------------------
    // CALCULAR STATUS
    // ----------------------------------------------

    let status = 'ATIVO';


    if (dataDevolucao) {

        status = 'DEVOLVIDO';

    } else {

        const hoje = new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const dataPrevistaObj =
            new Date(dataPrevista);


        if (dataPrevistaObj < hoje) {
            status = 'ATRASADO';
        }
    }


    // ----------------------------------------------
    // OBJETO
    // ----------------------------------------------

    const emprestimo = {

        id_emprestimo:
            Number(id),

        id_pessoa:
            Number(idPessoa),

        id_livro:
            Number(idLivro),

        data_emprestimo:
            dataEmprestimo,

        data_prevista_devolucao:
            dataPrevista,

        data_devolucao:
            dataDevolucao || null,

        status:
            status
    };


    try {

        let resposta;


        // ------------------------------------------
        // INSERIR
        // ------------------------------------------

        if (
            oQueEstaFazendo ===
            'inserindo'
        ) {

            resposta =
                await fetch(
                    `${URL_API}/emprestimo`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                emprestimo
                            )
                    }
                );
        }


        // ------------------------------------------
        // ALTERAR
        // ------------------------------------------

        else if (
            oQueEstaFazendo ===
            'alterando'
        ) {

            resposta =
                await fetch(
                    `${URL_API}/emprestimo/${id}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                emprestimo
                            )
                    }
                );
        }


        else {

            mostrarAviso(
                'Clique em Inserir ou Alterar antes de salvar.'
            );

            return;
        }


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao salvar empréstimo.'
            );
        }


        if (
            oQueEstaFazendo ===
            'inserindo'
        ) {

            mostrarAviso(
                'Empréstimo cadastrado com sucesso.'
            );

        } else {

            mostrarAviso(
                'Empréstimo alterado com sucesso.'
            );
        }


        limparCampos();

        await listarEmprestimos();

        await carregarResumo();


    } catch (erro) {

        console.error(
            'Erro ao salvar:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ======================================================
// DEVOLVER
// ======================================================

async function devolverEmprestimo(id) {

    const confirmar =
        confirm(
            'Confirmar a devolução deste livro?'
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/emprestimo/${id}/devolver`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({
                            data_devolucao:
                                obterDataAtual()
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao registrar devolução.'
            );
        }


        mostrarAviso(
            'Livro devolvido com sucesso.'
        );


        await listarEmprestimos();

        await carregarResumo();


    } catch (erro) {

        console.error(
            'Erro ao devolver livro:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ======================================================
// CANCELAR
// ======================================================

function cancelarOperacao() {

    oQueEstaFazendo = '';

    limparCampos();

    mostrarAviso(
        'Operação cancelada.'
    );
}


// ======================================================
// LIMPAR CAMPOS
// ======================================================

function limparCampos() {

    document.getElementById(
        'inputId_emprestimo'
    ).value = '';


    limparCamposDados();


    // ==================================================
    // IMPORTANTE:
    // O ID FICA LIBERADO
    // ==================================================

    document.getElementById(
        'inputId_emprestimo'
    ).readOnly = false;


    // ==================================================
    // OS OUTROS CAMPOS FICAM BLOQUEADOS
    // ==================================================

    bloquearCamposDados(true);


    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );


    oQueEstaFazendo = '';
}


// ======================================================
// LIMPAR CAMPOS DE DADOS
// ======================================================

function limparCamposDados() {

    document.getElementById(
        'selectId_pessoa'
    ).value = '';


    document.getElementById(
        'selectId_livro'
    ).value = '';


    document.getElementById(
        'inputData_emprestimo'
    ).value = '';


    document.getElementById(
        'inputData_prevista_devolucao'
    ).value = '';


    document.getElementById(
        'inputData_devolucao'
    ).value = '';


    document.getElementById(
        'selectStatus'
    ).value = 'ATIVO';
}


// ======================================================
// BLOQUEAR / DESBLOQUEAR CAMPOS DE DADOS
// ======================================================

function bloquearCamposDados(soLeitura) {

    document.getElementById(
        'selectId_pessoa'
    ).disabled = soLeitura;


    document.getElementById(
        'selectId_livro'
    ).disabled = soLeitura;


    document.getElementById(
        'inputData_emprestimo'
    ).readOnly = soLeitura;


    document.getElementById(
        'inputData_prevista_devolucao'
    ).readOnly = soLeitura;


    document.getElementById(
        'inputData_devolucao'
    ).readOnly = soLeitura;


    document.getElementById(
        'selectStatus'
    ).disabled = soLeitura;
}


// ======================================================
// COMPATIBILIDADE COM O NOME ANTIGO
// ======================================================

function bloquearAtributos(soLeitura) {

    bloquearCamposDados(soLeitura);
}


// ======================================================
// VISIBILIDADE DOS BOTÕES
// ======================================================

function visibilidadeDosBotoes(
    procure,
    inserir,
    alterar,
    excluir,
    salvar
) {

    document.getElementById(
        'btProcurar'
    ).style.display = procure;


    document.getElementById(
        'btInserir'
    ).style.display = inserir;


    document.getElementById(
        'btAlterar'
    ).style.display = alterar;


    document.getElementById(
        'btExcluir'
    ).style.display = excluir;


    document.getElementById(
        'btSalvar'
    ).style.display = salvar;


    document.getElementById(
        'btCancelar'
    ).style.display = salvar;
}


// ======================================================
// FORMATAR DATA PARA EXIBIÇÃO
// ======================================================

function formatarData(data) {

    if (!data) {
        return '-';
    }


    const partes =
        data
            .toString()
            .split('T')[0]
            .split('-');


    if (partes.length !== 3) {
        return data;
    }


    return `
        ${partes[2]}/${partes[1]}/${partes[0]}
    `;
}


// ======================================================
// FORMATAR DATA PARA INPUT
// ======================================================

function formatarDataInput(data) {

    if (!data) {
        return '';
    }


    return data
        .toString()
        .split('T')[0];
}


// ======================================================
// DATA ATUAL
// ======================================================

function obterDataAtual() {

    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, '0');


    const dia =
        String(
            hoje.getDate()
        ).padStart(2, '0');


    return `${ano}-${mes}-${dia}`;
}


// ======================================================
// AVISO
// ======================================================

function mostrarAviso(mensagem) {

    const aviso =
        document.getElementById(
            'divAviso'
        );


    aviso.textContent =
        mensagem;
}