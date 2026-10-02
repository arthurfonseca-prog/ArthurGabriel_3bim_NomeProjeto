const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let autor = null;


// ========================================
// INICIALIZAÇÃO
// ========================================

async function inicializar() {

    limparCampos();

    await listarAutores();
}


// ========================================
// LISTAR AUTORES
// ========================================

async function listarAutores() {

    try {

        const resposta = await fetch(`${URL_API}/autor/listar`);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar autores.');
        }

        const dados = await resposta.json();

        mostrarAutores(dados);

    } catch (erro) {

        console.error('Erro:', erro);

        document.getElementById('outputSaida').innerHTML =
            '<p>Não foi possível carregar os autores.</p>';
    }
}


// ========================================
// MOSTRAR AUTORES
// ========================================

function mostrarAutores(autores) {

    const output = document.getElementById('outputSaida');

    output.innerHTML = '';

    if (autores.length === 0) {

        output.innerHTML =
            '<p>Nenhum autor cadastrado.</p>';

        return;
    }


    autores.forEach(autor => {

        const card = document.createElement('div');

        card.classList.add('autor-card');

        card.innerHTML = `
            <div>
                <h4>${autor.nome}</h4>

                <p>
                    ID: ${autor.id_autor}
                </p>

                <p>
                    ${autor.biografia || 'Biografia não cadastrada.'}
                </p>
            </div>

            <div>
                <button onclick="carregarAutor(${autor.id_autor})">
                    Editar
                </button>

                <button onclick="excluirDireto(${autor.id_autor})">
                    Excluir
                </button>
            </div>
        `;

        output.appendChild(card);
    });
}


// ========================================
// PROCURAR AUTOR
// ========================================

async function procurar() {

    const campoId =
        document.getElementById('inputId_autor');

    const id = campoId.value.trim();


    if (
        id === '' ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso('Informe um ID inteiro.');

        return;
    }


    try {

        const resposta =
            await fetch(`${URL_API}/autor/${id}`);


        if (resposta.status === 404) {

            autor = null;

            limparCamposDados();

            carregarImagem(null);

            bloquearAtributos(true);

            visibilidadeDosBotoes(
                'inline',
                'inline',
                'none',
                'none',
                'none'
            );

            mostrarAviso(
                'Autor não encontrado. Pode inserir um novo autor.'
            );

            return;
        }


        if (!resposta.ok) {

            mostrarAviso(
                'Erro ao procurar autor.'
            );

            return;
        }


        autor = await resposta.json();

        mostrarDadosAutor(autor);

        visibilidadeDosBotoes(
            'inline',
            'none',
            'inline',
            'inline',
            'none'
        );

        mostrarAviso(
            'Autor encontrado. Pode alterar ou excluir.'
        );


    } catch (erro) {

        console.error('Erro:', erro);

        mostrarAviso(
            'Erro de comunicação com o servidor.'
        );
    }
}


// ========================================
// MOSTRAR DADOS DO AUTOR
// ========================================

function mostrarDadosAutor(a) {

    document.getElementById('inputId_autor').value =
        a.id_autor;

    document.getElementById('inputNome_autor').value =
        a.nome || '';

    document.getElementById('inputBiografia_autor').value =
        a.biografia || '';


    carregarImagem(
        a.id_autor,
        a.foto
    );

    bloquearAtributos(true);
}


// ========================================
// CARREGAR IMAGEM
// ========================================

function carregarImagem(
    id,
    caminhoBanco = null
) {

    const imagem =
        document.getElementById('imgAutor');


    if (caminhoBanco) {

        imagem.src =
            `${URL_API}/${caminhoBanco}?t=${Date.now()}`;

    } else if (id) {

        imagem.src =
            `${URL_API}/imagens/autores/${id}.png?t=${Date.now()}`;

    } else {

        imagem.src =
            SILHUETA_URL;
    }


    imagem.onerror = function () {

        imagem.src = SILHUETA_URL;
    };
}


// ========================================
// INSERIR
// ========================================

function inserir() {

    oQueEstaFazendo = 'inserindo';

    limparCamposDados();

    carregarImagem(null);

    // Libera todos os campos para o cadastro
    document.getElementById('inputId_autor').readOnly = false;
    document.getElementById('inputNome_autor').readOnly = false;
    document.getElementById('inputBiografia_autor').readOnly = false;

    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    mostrarAviso(
        'INSERINDO - Informe o ID, preencha os dados e clique em Salvar.'
    );
}

// ========================================
// ALTERAR
// ========================================

function alterar() {

    oQueEstaFazendo = 'alterando';


    // ID permanece bloqueado.
    document.getElementById(
        'inputId_autor'
    ).readOnly = true;


    // Nome e biografia ficam liberados.
    document.getElementById(
        'inputNome_autor'
    ).readOnly = false;

    document.getElementById(
        'inputBiografia_autor'
    ).readOnly = false;


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'ALTERANDO - Altere os dados, escolha uma nova imagem se quiser e clique em Salvar.'
    );
}


// ========================================
// EXCLUIR
// ========================================

function excluir() {

    oQueEstaFazendo = 'excluindo';

    bloquearAtributos(true);


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'EXCLUINDO - Clique em Salvar para confirmar a exclusão.'
    );
}


// ========================================
// EXCLUIR DIRETO PELA LISTA
// ========================================

async function excluirDireto(id) {

    const confirmar = confirm(
        `Deseja realmente excluir o autor de ID ${id}?`
    );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/autor/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                'Não foi possível excluir o autor.'
            );

            return;
        }


        alert(
            'Autor excluído com sucesso.'
        );


        limparCampos();

        await listarAutores();


    } catch (erro) {

        console.error('Erro:', erro);

        alert(
            'Erro de comunicação com o servidor.'
        );
    }
}


// ========================================
// SALVAR
// ========================================

async function salvar() {

    const id =
        document
            .getElementById('inputId_autor')
            .value
            .trim();


    const nome =
        document
            .getElementById('inputNome_autor')
            .value
            .trim();


    const biografia =
        document
            .getElementById('inputBiografia_autor')
            .value
            .trim();


    // ====================================
    // EXCLUSÃO
    // ====================================

    if (oQueEstaFazendo === 'excluindo') {

        try {

            const resposta =
                await fetch(
                    `${URL_API}/autor/${id}`,
                    {
                        method: 'DELETE'
                    }
                );


            const resultado =
                await resposta.json();


            if (!resposta.ok) {

                mostrarAviso(
                    resultado.mensagem ||
                    'Erro ao excluir autor.'
                );

                return;
            }


            mostrarAviso(
                'Autor excluído com sucesso!'
            );


            limparCampos();

            await listarAutores();

            return;


        } catch (erro) {

            console.error('Erro:', erro);

            mostrarAviso(
                'Erro de comunicação com o servidor.'
            );

            return;
        }
    }


    // ====================================
    // VALIDAÇÃO DO ID
    // ====================================

    if (
        id === '' ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            'Informe um ID inteiro para o autor.'
        );

        return;
    }


    // ====================================
    // VALIDAÇÃO DO NOME
    // ====================================

    if (nome === '') {

        mostrarAviso(
            'Informe o nome do autor.'
        );

        return;
    }


    // ====================================
    // DADOS DO AUTOR
    // ====================================

    const dadosAutor = {

        id_autor: id,

        nome: nome,

        biografia: biografia
    };


    let resposta;


    try {

        // =================================
        // INSERIR
        // =================================

        if (oQueEstaFazendo === 'inserindo') {

            resposta =
                await fetch(
                    `${URL_API}/autor`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(dadosAutor)
                    }
                );
        }


        // =================================
        // ALTERAR
        // =================================

        else if (oQueEstaFazendo === 'alterando') {

            resposta =
                await fetch(
                    `${URL_API}/autor/${id}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(dadosAutor)
                    }
                );
        }


        else {

            mostrarAviso(
                'Nenhuma operação selecionada.'
            );

            return;
        }


        // =================================
        // RESPOSTA DO SERVIDOR
        // =================================

        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            mostrarAviso(
                resultado.mensagem ||
                resultado.erro ||
                'Erro ao salvar autor.'
            );

            return;
        }


        // =================================
        // ID DO AUTOR
        // =================================

        const idAutor =
            resultado.id_autor;


        if (!idAutor) {

            mostrarAviso(
                'Autor salvo, mas o servidor não retornou o ID.'
            );

            return;
        }


        // =================================
        // ENVIAR IMAGEM
        // =================================

        await uploadImagemParaServidor(idAutor);


        // =================================
        // MENSAGEM
        // =================================

        if (oQueEstaFazendo === 'inserindo') {

            mostrarAviso(
                'Autor cadastrado com sucesso!'
            );

        } else {

            mostrarAviso(
                'Autor alterado com sucesso!'
            );
        }


        // =================================
        // ATUALIZAR TELA
        // =================================

        limparCampos();

        await listarAutores();


    } catch (erro) {

        console.error('Erro:', erro);

        mostrarAviso(
            'Erro de comunicação com o servidor.'
        );
    }
}


// ========================================
// UPLOAD DA IMAGEM
// ========================================

async function uploadImagemParaServidor(id) {

    const input =
        document.getElementById('inputImagem');


    if (
        !input.files ||
        input.files.length === 0
    ) {

        // Nenhuma imagem nova escolhida.
        return;
    }


    const formData =
        new FormData();


    formData.append(
        'imagem',
        input.files[0]
    );


    try {

        const resposta =
            await fetch(
                `${URL_API}/autor/upload/${id}`,
                {
                    method: 'POST',
                    body: formData
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                'Erro ao enviar imagem.'
            );
        }


        console.log(
            'Imagem do autor enviada com sucesso.'
        );


    } catch (erro) {

        console.error(
            'Erro ao enviar imagem:',
            erro
        );


        mostrarAviso(
            'Autor salvo, mas houve erro ao salvar a imagem.'
        );
    }
}


// ========================================
// CARREGAR AUTOR DA LISTA
// ========================================

async function carregarAutor(id) {

    document.getElementById(
        'inputId_autor'
    ).value = id;


    await procurar();
}


// ========================================
// CANCELAR
// ========================================

function cancelarOperacao() {

    limparCampos();

    mostrarAviso(
        'Informe o ID e clique em Procurar.'
    );
}


// ========================================
// IMAGEM
// ========================================

function acionarUpload() {

    if (
        oQueEstaFazendo !== 'inserindo' &&
        oQueEstaFazendo !== 'alterando'
    ) {

        mostrarAviso(
            'Clique em Inserir ou Alterar primeiro para escolher uma imagem.'
        );

        return;
    }


    document
        .getElementById('inputImagem')
        .click();
}


function previewImagem() {

    const input =
        document.getElementById('inputImagem');


    if (
        input.files &&
        input.files.length > 0
    ) {

        const arquivo =
            input.files[0];


        document.getElementById(
            'imgAutor'
        ).src =
            URL.createObjectURL(arquivo);


        mostrarAviso(
            'Imagem escolhida! Clique em Salvar para concluir.'
        );
    }
}


// ========================================
// LIMPAR CAMPOS
// ========================================

function limparCampos() {

    autor = null;

    oQueEstaFazendo = '';


    document.getElementById(
        'inputId_autor'
    ).value = '';


    limparCamposDados();


    document.getElementById(
        'inputImagem'
    ).value = '';


    carregarImagem(null);


    // Estado inicial:
    // ID disponível para procurar.
    // Dados bloqueados.

    bloquearAtributos(true);


    visibilidadeDosBotoes(
        'inline',
        'inline',
        'none',
        'none',
        'none'
    );
}


// ========================================
// LIMPAR DADOS
// ========================================

function limparCamposDados() {

    document.getElementById(
        'inputNome_autor'
    ).value = '';


    document.getElementById(
        'inputBiografia_autor'
    ).value = '';
}


// ========================================
// BLOQUEAR / LIBERAR CAMPOS
// ========================================

function bloquearAtributos(soLeitura) {

    // ID:
    // true  = pode digitar/procurar
    // false = bloqueado

    document.getElementById(
        'inputId_autor'
    ).readOnly = !soLeitura;


    // Dados:
    // true  = bloqueados
    // false = liberados

    document.getElementById(
        'inputNome_autor'
    ).readOnly = soLeitura;


    document.getElementById(
        'inputBiografia_autor'
    ).readOnly = soLeitura;
}


// ========================================
// VISIBILIDADE DOS BOTÕES
// ========================================

function visibilidadeDosBotoes(
    btP,
    btI,
    btA,
    btE,
    btS
) {

    document.getElementById(
        'btProcurar'
    ).style.display = btP;


    document.getElementById(
        'btInserir'
    ).style.display = btI;


    document.getElementById(
        'btAlterar'
    ).style.display = btA;


    document.getElementById(
        'btExcluir'
    ).style.display = btE;


    document.getElementById(
        'btSalvar'
    ).style.display = btS;


    document.getElementById(
        'btCancelar'
    ).style.display = btS;
}


// ========================================
// AVISOS
// ========================================

function mostrarAviso(mensagem) {

    document.getElementById(
        'divAviso'
    ).innerText = mensagem;
}