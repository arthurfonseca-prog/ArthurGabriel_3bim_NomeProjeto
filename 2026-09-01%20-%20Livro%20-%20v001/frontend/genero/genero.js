const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';


// ================================================
// INICIALIZAÇÃO
// ================================================

function inicializar() {

    limparCampos();

    listarGeneros();
}


// ================================================
// LISTAR GÊNEROS
// ================================================

async function listarGeneros() {

    try {

        const resposta = await fetch(
            `${URL_API}/genero/listar`
        );

        if (!resposta.ok) {
            throw new Error('Erro ao buscar os gêneros.');
        }

        const dados = await resposta.json();

        mostrarGeneros(dados);

    } catch (erro) {

        console.error('Erro ao listar gêneros:', erro);

        document.getElementById('outputSaida').innerHTML = `
            <p>Não foi possível carregar os gêneros.</p>
        `;
    }
}


// ================================================
// MOSTRAR GÊNEROS
// ================================================

function mostrarGeneros(generos) {

    const lista = document.getElementById('outputSaida');

    lista.innerHTML = '';

    if (generos.length === 0) {

        lista.innerHTML = `
            <p>Nenhum gênero cadastrado.</p>
        `;

        return;
    }

    generos.forEach(genero => {

        const card = document.createElement('article');

        card.classList.add('card-genero');

        card.innerHTML = `
            <h3>${genero.nome}</h3>

            <p>
                ${genero.descricao || 'Descrição não cadastrada.'}
            </p>

            <button onclick="procurar(${genero.id_genero})">
                Editar
            </button>

            <button onclick="excluirDireto(${genero.id_genero})">
                Excluir
            </button>
        `;

        lista.appendChild(card);
    });
}


// ================================================
// PROCURAR GÊNERO
// ================================================

async function procurar(id = null) {

    if (id === null) {

        id = document
            .getElementById('inputId_genero')
            .value
            .trim();
    }

    if (!id) {

        mostrarAviso(
            'Digite o ID do gênero.'
        );

        return;
    }

    const idNumerico = parseInt(id, 10);

    if (isNaN(idNumerico)) {

        mostrarAviso(
            'O ID deve ser um número inteiro.'
        );

        return;
    }

    try {

        const resposta = await fetch(
            `${URL_API}/genero/${idNumerico}`
        );

        if (!resposta.ok) {

            if (resposta.status === 404) {

                // Não encontrou:
                // prepara o formulário para INSERÇÃO.

                limparCamposDados();

                document.getElementById(
                    'inputId_genero'
                ).value = idNumerico;

                bloquearAtributos(false);

                visibilidadeDosBotoes(
                    'inline',  // procurar
                    'inline',  // inserir
                    'none',    // alterar
                    'none',    // excluir
                    'none'     // salvar
                );

                mostrarAviso(
                    'Gênero não encontrado. Clique em Inserir para cadastrá-lo.'
                );

                return;
            }

            throw new Error(
                'Erro ao procurar gênero.'
            );
        }

        const dados = await resposta.json();

        const genero = dados.genero || dados;

        preencherCampos(genero);

        oQueEstaFazendo = '';

        // Encontrou:
        // campos ficam bloqueados.
        bloquearAtributos(true);

        visibilidadeDosBotoes(
            'inline',  // procurar
            'none',    // inserir
            'inline',  // alterar
            'inline',  // excluir
            'none'     // salvar
        );

        mostrarAviso(
            'Gênero encontrado.'
        );

    } catch (erro) {

        console.error('Erro ao procurar gênero:', erro);

        mostrarAviso(
            erro.message
        );
    }
}


// ================================================
// PREENCHER CAMPOS
// ================================================

function preencherCampos(genero) {

    document.getElementById(
        'inputId_genero'
    ).value = genero.id_genero;

    document.getElementById(
        'inputNome_genero'
    ).value = genero.nome || '';

    document.getElementById(
        'inputDescricao_genero'
    ).value = genero.descricao || '';
}


// ================================================
// INSERIR
// ================================================

function inserir() {

    oQueEstaFazendo = 'inserindo';

    limparCamposDados();

    // ID também pode ser digitado durante inserção.
    document.getElementById(
        'inputId_genero'
    ).readOnly = false;

    document.getElementById(
        'inputNome_genero'
    ).readOnly = false;

    document.getElementById(
        'inputDescricao_genero'
    ).readOnly = false;

    visibilidadeDosBotoes(
        'none',    // procurar
        'none',    // inserir
        'none',    // alterar
        'none',    // excluir
        'inline'   // salvar
    );

    mostrarAviso(
        'INSERINDO - Informe o ID, preencha os dados e clique em Salvar.'
    );

    document.getElementById(
        'inputId_genero'
    ).focus();
}


// ================================================
// ALTERAR
// ================================================

function alterar() {

    const id = document
        .getElementById('inputId_genero')
        .value
        .trim();

    if (!id) {

        mostrarAviso(
            'Primeiro procure um gênero.'
        );

        return;
    }

    oQueEstaFazendo = 'alterando';

    // ID não pode ser alterado.
    document.getElementById(
        'inputId_genero'
    ).readOnly = true;

    // Dados podem ser alterados.
    document.getElementById(
        'inputNome_genero'
    ).readOnly = false;

    document.getElementById(
        'inputDescricao_genero'
    ).readOnly = false;

    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    mostrarAviso(
        'ALTERANDO - Altere os dados e clique em Salvar.'
    );

    document.getElementById(
        'inputNome_genero'
    ).focus();
}


// ================================================
// EXCLUIR
// ================================================

function excluir() {

    const id = document
        .getElementById('inputId_genero')
        .value
        .trim();

    if (!id) {

        mostrarAviso(
            'Primeiro procure um gênero.'
        );

        return;
    }

    excluirDireto(id);
}


// ================================================
// EXCLUIR DIRETAMENTE
// ================================================

async function excluirDireto(id) {

    const confirmar = confirm(
        'Tem certeza que deseja excluir este gênero?'
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `${URL_API}/genero/${id}`,
            {
                method: 'DELETE'
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao excluir gênero.'
            );
        }

        mostrarAviso(
            'Gênero excluído com sucesso.'
        );

        limparCampos();

        listarGeneros();

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


// ================================================
// SALVAR
// ================================================

async function salvar() {

    const id = document
        .getElementById('inputId_genero')
        .value
        .trim();

    const nome = document
        .getElementById('inputNome_genero')
        .value
        .trim();

    const descricao = document
        .getElementById('inputDescricao_genero')
        .value
        .trim();


    // ============================================
    // VALIDAÇÕES
    // ============================================

    if (!id) {

        mostrarAviso(
            'Informe o ID do gênero.'
        );

        return;
    }

    const idNumerico = parseInt(id, 10);

    if (isNaN(idNumerico)) {

        mostrarAviso(
            'O ID deve ser um número inteiro.'
        );

        return;
    }

    if (!nome) {

        mostrarAviso(
            'O nome do gênero é obrigatório.'
        );

        return;
    }


    // ============================================
    // OBJETO
    // ============================================

    const genero = {

        id_genero: idNumerico,

        nome: nome,

        descricao: descricao || null
    };


    try {

        let resposta;


        // ========================================
        // INSERIR
        // ========================================

        if (oQueEstaFazendo === 'inserindo') {

            resposta = await fetch(
                `${URL_API}/genero`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(genero)
                }
            );
        }


        // ========================================
        // ALTERAR
        // ========================================

        else if (oQueEstaFazendo === 'alterando') {

            resposta = await fetch(
                `${URL_API}/genero/${idNumerico}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        nome: nome,
                        descricao: descricao || null
                    })
                }
            );
        }


        // ========================================
        // NENHUMA OPERAÇÃO
        // ========================================

        else {

            mostrarAviso(
                'Clique em Inserir ou Alterar antes de salvar.'
            );

            return;
        }


        // ========================================
        // RESPOSTA
        // ========================================

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao salvar gênero.'
            );
        }


        if (oQueEstaFazendo === 'inserindo') {

            mostrarAviso(
                'Gênero cadastrado com sucesso.'
            );

        } else {

            mostrarAviso(
                'Gênero alterado com sucesso.'
            );
        }


        limparCampos();

        listarGeneros();

    } catch (erro) {

        console.error(
            'Erro ao salvar gênero:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ================================================
// CANCELAR
// ================================================

function cancelarOperacao() {

    oQueEstaFazendo = '';

    limparCampos();

    mostrarAviso(
        'Operação cancelada.'
    );
}


// ================================================
// LIMPAR TODOS OS CAMPOS
// ================================================

function limparCampos() {

    document.getElementById(
        'inputId_genero'
    ).value = '';

    limparCamposDados();

    bloquearAtributos(true);

    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );

    oQueEstaFazendo = '';
}


// ================================================
// LIMPAR CAMPOS DE DADOS
// ================================================

function limparCamposDados() {

    document.getElementById(
        'inputNome_genero'
    ).value = '';

    document.getElementById(
        'inputDescricao_genero'
    ).value = '';
}


// ================================================
// BLOQUEAR / DESBLOQUEAR ATRIBUTOS
// ================================================

function bloquearAtributos(soLeitura) {

    // ID
    document.getElementById(
        'inputId_genero'
    ).readOnly = !soLeitura;


    // Nome
    document.getElementById(
        'inputNome_genero'
    ).readOnly = soLeitura;


    // Descrição
    document.getElementById(
        'inputDescricao_genero'
    ).readOnly = soLeitura;
}


// ================================================
// VISIBILIDADE DOS BOTÕES
// ================================================

function visibilidadeDosBotoes(
    btProcurar,
    btInserir,
    btAlterar,
    btExcluir,
    btSalvar
) {

    document.getElementById(
        'btProcurar'
    ).style.display = btProcurar;

    document.getElementById(
        'btInserir'
    ).style.display = btInserir;

    document.getElementById(
        'btAlterar'
    ).style.display = btAlterar;

    document.getElementById(
        'btExcluir'
    ).style.display = btExcluir;

    document.getElementById(
        'btSalvar'
    ).style.display = btSalvar;

    // Cancelar acompanha o Salvar.
    document.getElementById(
        'btCancelar'
    ).style.display = btSalvar;
}


// ================================================
// MOSTRAR AVISO
// ================================================

function mostrarAviso(mensagem) {

    document.getElementById(
        'divAviso'
    ).textContent = mensagem;
}