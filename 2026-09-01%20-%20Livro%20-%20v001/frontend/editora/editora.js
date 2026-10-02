const URL_API = 'http://localhost:3001';

const SILHUETA_URL =
    `${URL_API}/imagens/silhueta.png`;

const DEFAULT_LOGO_URL =
    `${URL_API}/imagens/editoras/default.png`;

let oQueEstaFazendo = '';


// ==================================================
// INICIALIZAÇÃO
// ==================================================

function inicializar() {

    limparCampos();

    listarEditoras();
}


// ==================================================
// LISTAR EDITORAS
// ==================================================

async function listarEditoras() {

    try {

        const resposta = await fetch(
            `${URL_API}/editora/listar`
        );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao buscar editoras.'
            );
        }

        const editoras = await resposta.json();

        mostrarEditoras(editoras);

    } catch (erro) {

        console.error(
            'Erro ao listar editoras:',
            erro
        );

        document.getElementById(
            'outputSaida'
        ).innerHTML =
            '<p>Não foi possível carregar as editoras.</p>';
    }
}


// ==================================================
// MOSTRAR EDITORAS
// ==================================================

function mostrarEditoras(editoras) {

    const lista =
        document.getElementById('outputSaida');

    lista.innerHTML = '';

    if (editoras.length === 0) {

        lista.innerHTML =
            '<p>Nenhuma editora cadastrada.</p>';

        return;
    }

    editoras.forEach(editora => {

        const card =
            document.createElement('article');

        card.classList.add('card-editora');

        const logo = obterUrlImagem(
            editora.logo
        );

        card.innerHTML = `
            <img
                src="${logo}"
                alt="Logo da editora ${editora.nome}"
                onerror="this.src='${DEFAULT_LOGO_URL}'"
            >

            <div class="dados-editora">

                <h3>${editora.nome}</h3>

                <p>
                    <strong>País:</strong>
                    ${editora.pais || 'Não informado'}
                </p>

                <p>
                    <strong>Site:</strong>
                    ${editora.site || 'Não informado'}
                </p>

                <div class="botoes-card">

                    <button
                        onclick="procurar(${editora.id_editora})">
                        Editar
                    </button>

                    <button
                        onclick="excluirDireto(${editora.id_editora})">
                        Excluir
                    </button>

                </div>

            </div>
        `;

        lista.appendChild(card);
    });
}


// ==================================================
// CONVERTER CAMINHO DA IMAGEM
// ==================================================

function obterUrlImagem(caminho) {

    if (!caminho) {
        return DEFAULT_LOGO_URL;
    }

    if (caminho.startsWith('http')) {
        return caminho;
    }

    if (caminho.startsWith('/')) {
        return `${URL_API}${caminho}`;
    }

    return `${URL_API}/${caminho}`;
}


// ==================================================
// PROCURAR
// ==================================================

async function procurar(id = null) {

    if (id === null) {

        id =
            document.getElementById(
                'inputId_editora'
            ).value.trim();
    }

    if (
        id === '' ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            'O ID precisa ser um número inteiro.'
        );

        return;
    }

    try {

        const resposta = await fetch(
            `${URL_API}/editora/${id}`
        );

        if (resposta.status === 404) {

            limparCamposDados();
            carregarImagem(null);

            bloquearAtributos(false);

            visibilidadeDosBotoes(
                'inline',
                'inline',
                'none',
                'none',
                'none'
            );

            mostrarAviso(
                'Editora não encontrada. Você pode cadastrá-la.'
            );

            return;
        }

        if (!resposta.ok) {
            throw new Error(
                'Erro ao procurar editora.'
            );
        }

        const editora =
            await resposta.json();

        preencherCampos(editora);

        bloquearAtributos(true);

        visibilidadeDosBotoes(
            'inline',
            'none',
            'inline',
            'inline',
            'none'
        );

        oQueEstaFazendo = '';

        mostrarAviso(
            'Editora encontrada. Pode alterar ou excluir.'
        );

    } catch (erro) {

        console.error(
            'Erro ao procurar editora:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ==================================================
// PREENCHER CAMPOS
// ==================================================

function preencherCampos(editora) {

    document.getElementById(
        'inputId_editora'
    ).value =
        editora.id_editora;

    document.getElementById(
        'inputNome_editora'
    ).value =
        editora.nome || '';

    document.getElementById(
        'inputPais_editora'
    ).value =
        editora.pais || '';

    document.getElementById(
        'inputSite_editora'
    ).value =
        editora.site || '';

    carregarImagem(editora.logo);
}


// ==================================================
// INSERIR
// ==================================================

function inserir() {

    oQueEstaFazendo =
        'inserindo';

    limparCamposDados();

    document.getElementById(
        'inputImagem'
    ).value = '';

    carregarImagem(null);

    bloquearAtributos(false);

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

    document.getElementById(
        'inputId_editora'
    ).focus();
}


// ==================================================
// ALTERAR
// ==================================================

function alterar() {

    const id =
        document.getElementById(
            'inputId_editora'
        ).value;

    if (!id) {

        mostrarAviso(
            'Primeiro procure uma editora.'
        );

        return;
    }

    oQueEstaFazendo =
        'alterando';

    // ID continua bloqueado.
    // Os demais campos ficam liberados.
    document.getElementById(
        'inputId_editora'
    ).readOnly = true;

    document.getElementById(
        'inputNome_editora'
    ).readOnly = false;

    document.getElementById(
        'inputPais_editora'
    ).readOnly = false;

    document.getElementById(
        'inputSite_editora'
    ).readOnly = false;

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


// ==================================================
// EXCLUIR
// ==================================================

function excluir() {

    const id =
        document.getElementById(
            'inputId_editora'
        ).value;

    if (!id) {

        mostrarAviso(
            'Primeiro procure uma editora.'
        );

        return;
    }

    excluirDireto(id);
}


// ==================================================
// EXCLUIR DIRETO
// ==================================================

async function excluirDireto(id) {

    const confirmar =
        confirm(
            'Tem certeza que deseja excluir esta editora?'
        );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `${URL_API}/editora/${id}`,
            {
                method: 'DELETE'
            }
        );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                'Erro ao excluir editora.'
            );
        }

        limparCampos();

        listarEditoras();

        mostrarAviso(
            'Editora excluída com sucesso.'
        );

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


// ==================================================
// SALVAR
// ==================================================

async function salvar() {

    const id =
        document.getElementById(
            'inputId_editora'
        ).value.trim();

    const nome =
        document.getElementById(
            'inputNome_editora'
        ).value.trim();

    const pais =
        document.getElementById(
            'inputPais_editora'
        ).value.trim();

    const site =
        document.getElementById(
            'inputSite_editora'
        ).value.trim();


    // ------------------------------------------
    // VALIDAÇÕES
    // ------------------------------------------

    if (
        id === '' ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            'Informe um ID inteiro para a editora.'
        );

        return;
    }

    if (!nome) {

        mostrarAviso(
            'O nome da editora é obrigatório.'
        );

        return;
    }


    const dadosEditora = {

        id_editora: Number(id),

        nome: nome,

        pais: pais || null,

        site: site || null
    };


    try {

        let resposta;


        // ======================================
        // INSERIR
        // ======================================

        if (
            oQueEstaFazendo ===
            'inserindo'
        ) {

            resposta = await fetch(
                `${URL_API}/editora`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            dadosEditora
                        )
                }
            );
        }


        // ======================================
        // ALTERAR
        // ======================================

        else if (
            oQueEstaFazendo ===
            'alterando'
        ) {

            resposta = await fetch(
                `${URL_API}/editora/${id}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            dadosEditora
                        )
                }
            );
        }


        // ======================================
        // NENHUMA OPERAÇÃO
        // ======================================

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
                'Erro ao salvar editora.'
            );
        }


        // ======================================
        // UPLOAD DA IMAGEM
        // ======================================

        const inputImagem =
            document.getElementById(
                'inputImagem'
            );

        if (
            inputImagem.files.length > 0
        ) {

            await enviarImagem(
                dados.id_editora ||
                Number(id)
            );
        }


        // ======================================
        // FINALIZAÇÃO
        // ======================================

        limparCampos();

        listarEditoras();

        mostrarAviso(
            oQueEstaFazendo ===
            'inserindo'
                ? 'Editora cadastrada com sucesso.'
                : 'Editora alterada com sucesso.'
        );

    } catch (erro) {

        console.error(
            'Erro ao salvar editora:',
            erro
        );

        mostrarAviso(
            erro.message
        );
    }
}


// ==================================================
// UPLOAD DA LOGO
// ==================================================

async function enviarImagem(id) {

    const input =
        document.getElementById(
            'inputImagem'
        );

    if (!input.files.length) {
        return;
    }

    const formData =
        new FormData();

    formData.append(
        'imagem',
        input.files[0]
    );

    const resposta =
        await fetch(
            `${URL_API}/editora/upload/${id}`,
            {
                method: 'POST',
                body: formData
            }
        );

    const dados =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.mensagem ||
            'Erro ao enviar logo.'
        );
    }
}


// ==================================================
// CARREGAR IMAGEM
// ==================================================

function carregarImagem(caminho) {

    const img =
        document.getElementById(
            'imgEditora'
        );

    if (!caminho) {

        img.src =
            SILHUETA_URL;

        return;
    }

    img.src =
        `${obterUrlImagem(caminho)}?t=${Date.now()}`;

    img.onerror = function () {

        this.onerror = null;

        this.src =
            SILHUETA_URL;
    };
}


// ==================================================
// ACIONAR UPLOAD
// ==================================================

function acionarUpload() {

    if (
        oQueEstaFazendo !==
        'inserindo' &&
        oQueEstaFazendo !==
        'alterando'
    ) {

        mostrarAviso(
            'Clique em Inserir ou Alterar primeiro para escolher uma imagem.'
        );

        return;
    }

    document.getElementById(
        'inputImagem'
    ).click();
}


// ==================================================
// PREVIEW
// ==================================================

function previewImagem() {

    const input =
        document.getElementById(
            'inputImagem'
        );

    if (
        input.files.length === 0
    ) {
        return;
    }

    const url =
        URL.createObjectURL(
            input.files[0]
        );

    document.getElementById(
        'imgEditora'
    ).src = url;

    mostrarAviso(
        'Logo escolhida! Clique em Salvar para concluir.'
    );
}


// ==================================================
// CANCELAR
// ==================================================

function cancelarOperacao() {

    limparCampos();

    mostrarAviso(
        'Operação cancelada.'
    );
}


// ==================================================
// LIMPAR CAMPOS
// ==================================================

function limparCampos() {

    oQueEstaFazendo = '';

    document.getElementById(
        'inputId_editora'
    ).value = '';

    limparCamposDados();

    document.getElementById(
        'inputImagem'
    ).value = '';

    carregarImagem(null);

    bloquearAtributos(true);

    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );
}


// ==================================================
// LIMPAR DADOS
// ==================================================

function limparCamposDados() {

    document.getElementById(
        'inputNome_editora'
    ).value = '';

    document.getElementById(
        'inputPais_editora'
    ).value = '';

    document.getElementById(
        'inputSite_editora'
    ).value = '';
}


// ==================================================
// BLOQUEAR / LIBERAR ATRIBUTOS
// ==================================================

function bloquearAtributos(soLeitura) {

    // ID
    document.getElementById(
        'inputId_editora'
    ).readOnly = !soLeitura;


    // Nome
    document.getElementById(
        'inputNome_editora'
    ).readOnly = soLeitura;


    // País
    document.getElementById(
        'inputPais_editora'
    ).readOnly = soLeitura;


    // Site
    document.getElementById(
        'inputSite_editora'
    ).readOnly = soLeitura;
}


// ==================================================
// VISIBILIDADE DOS BOTÕES
// ==================================================

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


// ==================================================
// AVISO
// ==================================================

function mostrarAviso(mensagem) {

    document.getElementById(
        'divAviso'
    ).textContent = mensagem;
}