/* =========================
   CONFIGURAÇÕES
   ========================= */

const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let pessoa = null;


/* =========================
   INICIALIZAÇÃO
   ========================= */

async function inicializar() {

    bloquearAtributos(true);

    carregarImagem(null);

    await listarPessoas();
}


/* =========================
   LISTAR PESSOAS
   ========================= */

async function listarPessoas() {

    try {

        const resposta = await fetch(
            `${URL_API}/pessoa/listar`
        );

        if (!resposta.ok) {
            throw new Error('Erro ao buscar pessoas.');
        }

        const dados = await resposta.json();

        mostrarPessoas(dados);

    } catch (erro) {

        console.error('Erro ao listar pessoas:', erro);

        document.getElementById('outputSaida').innerHTML =
            '<p>Não foi possível carregar as pessoas.</p>';
    }
}


/* =========================
   MOSTRAR PESSOAS
   ========================= */

function mostrarPessoas(pessoas) {

    const output =
        document.getElementById('outputSaida');

    output.innerHTML = '';

    if (pessoas.length === 0) {

        output.innerHTML =
            '<p>Nenhuma pessoa cadastrada.</p>';

        return;
    }


    pessoas.forEach(pessoa => {

        const card =
            document.createElement('article');

        card.classList.add('card-pessoa');


        const caminhoImagem =
            `${URL_API}/imagens/pessoa/${pessoa.id_pessoa}.png`;


        card.innerHTML = `

            <img
                src="${caminhoImagem}"
                alt="Foto de ${pessoa.nome}"
                onerror="this.src='${SILHUETA_URL}'"
            >

            <div>

                <h4>${pessoa.nome}</h4>

                <p>
                    ID: ${pessoa.id_pessoa}
                </p>

                <p>
                    E-mail:
                    ${pessoa.email || 'Não informado'}
                </p>

                <p>
                    Telefone:
                    ${pessoa.telefone || 'Não informado'}
                </p>

                <button
                    onclick="carregarPessoa(${pessoa.id_pessoa})"
                >
                    Editar
                </button>

                <button
                    onclick="excluirDireto(${pessoa.id_pessoa})"
                >
                    Excluir
                </button>

            </div>
        `;


        output.appendChild(card);

    });
}


/* =========================
   CARREGAR IMAGEM
   ========================= */

function carregarImagem(id) {

    const img =
        document.getElementById('imgPessoa');


    if (!id) {

        img.src = SILHUETA_URL;

        return;
    }


    img.src =
        `${URL_API}/imagens/pessoa/${id}.png?t=${new Date().getTime()}`;


    img.onerror = function () {

        img.src = SILHUETA_URL;

    };
}


/* =========================
   ACIONAR UPLOAD
   ========================= */

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


/* =========================
   PREVISUALIZAR IMAGEM
   ========================= */

function previewImagem() {

    const input =
        document.getElementById('inputImagem');

    if (input.files.length === 0) {
        return;
    }


    const url =
        URL.createObjectURL(input.files[0]);


    document
        .getElementById('imgPessoa')
        .src = url;


    mostrarAviso(
        'Imagem escolhida! Clique em Salvar para concluir.'
    );
}


/* =========================
   ENVIAR IMAGEM
   ========================= */

async function uploadImagemParaServidor(id) {

    const input =
        document.getElementById('inputImagem');


    if (input.files.length === 0) {

        return true;
    }


    const formData = new FormData();

    formData.append(
        'imagem',
        input.files[0]
    );


    try {

        const resposta = await fetch(
            `${URL_API}/pessoa/upload/${id}`,
            {
                method: 'POST',
                body: formData
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            mostrarAviso(
                dados.mensagem ||
                'Erro ao enviar imagem.'
            );

            return false;
        }


        return true;


    } catch (erro) {

        console.error(
            'Erro ao enviar imagem:',
            erro
        );

        mostrarAviso(
            'Erro de comunicação ao enviar a imagem.'
        );

        return false;
    }
}


/* =========================
   PROCURAR PESSOA
   ========================= */

async function procurar() {

    const id =
        document
            .getElementById('inputId_pessoa')
            .value
            .trim();


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
            `${URL_API}/pessoa/${id}`
        );


        if (resposta.status === 404) {

            pessoa = null;

            limparCamposDados();

            carregarImagem(null);

            /*
             * Mantemos o ID digitado,
             * porque ele será utilizado
             * para inserir a nova pessoa.
             */

            document
                .getElementById('inputId_pessoa')
                .value = id;


            bloquearAtributos(true);


            visibilidadeDosBotoes(
                'inline',
                'inline',
                'none',
                'none',
                'none'
            );


            mostrarAviso(
                'Pessoa não encontrada. Clique em Inserir para cadastrá-la.'
            );

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                'Erro ao procurar pessoa.'
            );
        }


        pessoa = await resposta.json();


        mostrarDadosPessoa(pessoa);

        carregarImagem(pessoa.id_pessoa);


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
            'Pessoa encontrada. Pode alterar ou excluir.'
        );


    } catch (erro) {

        console.error(
            'Erro ao procurar pessoa:',
            erro
        );

        mostrarAviso(
            'Erro de comunicação com o servidor.'
        );
    }
}


/* =========================
   MOSTRAR DADOS
   ========================= */

function mostrarDadosPessoa(p) {

    document
        .getElementById('inputId_pessoa')
        .value = p.id_pessoa;


    document
        .getElementById('inputNome_pessoa')
        .value = p.nome || '';


    document
        .getElementById('inputEmail_pessoa')
        .value = p.email || '';


    document
        .getElementById('inputTelefone_pessoa')
        .value = p.telefone || '';
}


/* =========================
   INSERIR
   ========================= */

function inserir() {

    oQueEstaFazendo = 'inserindo';

    pessoa = null;


    /*
     * NÃO limpamos o ID.
     *
     * Se o usuário pesquisou um ID que
     * não existe, esse ID será usado
     * para cadastrar a pessoa.
     */

    limparCamposDados();

    document
        .getElementById('inputImagem')
        .value = '';


    carregarImagem(null);


    /*
     * Agora todos os campos precisam
     * estar liberados.
     */

    bloquearAtributos(false);


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'INSERINDO - Informe o ID, preencha os dados, escolha a imagem e clique em Salvar.'
    );
}


/* =========================
   ALTERAR
   ========================= */

function alterar() {

    const id =
        document
            .getElementById('inputId_pessoa')
            .value
            .trim();


    if (id === '') {

        mostrarAviso(
            'Primeiro procure uma pessoa.'
        );

        return;
    }


    oQueEstaFazendo = 'alterando';


    /*
     * Libera nome, e-mail e telefone,
     * mas mantém o ID bloqueado.
     */

    bloquearAtributos(false);


    document
        .getElementById('inputId_pessoa')
        .readOnly = true;


    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );


    mostrarAviso(
        'ALTERANDO - Altere os dados, troque a imagem se desejar e clique em Salvar.'
    );
}


/* =========================
   EXCLUIR
   ========================= */

function excluir() {

    const id =
        document
            .getElementById('inputId_pessoa')
            .value
            .trim();


    if (id === '') {

        mostrarAviso(
            'Primeiro procure uma pessoa.'
        );

        return;
    }


    oQueEstaFazendo = 'excluindo';


    /*
     * Tudo bloqueado durante exclusão.
     */

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


/* =========================
   EXCLUIR DIRETO
   ========================= */

async function excluirDireto(id) {

    const confirmar = confirm(
        `Deseja realmente excluir a pessoa de ID ${id}?`
    );


    if (!confirmar) {
        return;
    }


    try {

        const resposta = await fetch(
            `${URL_API}/pessoa/${id}`,
            {
                method: 'DELETE'
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                'Não foi possível excluir a pessoa.'
            );

            return;
        }


        alert(
            'Pessoa excluída com sucesso.'
        );


        limparCampos();

        await listarPessoas();


    } catch (erro) {

        console.error(
            'Erro ao excluir:',
            erro
        );

        alert(
            'Erro de comunicação com o servidor.'
        );
    }
}


/* =========================
   SALVAR
   ========================= */

async function salvar() {

    const id =
        document
            .getElementById('inputId_pessoa')
            .value
            .trim();


    const nome =
        document
            .getElementById('inputNome_pessoa')
            .value
            .trim();


    const email =
        document
            .getElementById('inputEmail_pessoa')
            .value
            .trim();


    const telefone =
        document
            .getElementById('inputTelefone_pessoa')
            .value
            .trim();


    /*
     * ID obrigatório
     */

    if (
        id === '' ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            'Informe um ID inteiro para a pessoa.'
        );

        return;
    }


    /*
     * Nome obrigatório
     */

    if (nome === '') {

        mostrarAviso(
            'Informe o nome da pessoa.'
        );

        return;
    }


    /*
     * Objeto enviado ao servidor.
     *
     * IMPORTANTE:
     * agora enviamos id_pessoa também.
     */

    const dadosPessoa = {

        id_pessoa: Number(id),

        nome: nome,

        email: email,

        telefone: telefone

    };


    try {


        /* =========================
           INSERIR
           ========================= */

        if (oQueEstaFazendo === 'inserindo') {

            const resposta =
                await fetch(
                    `${URL_API}/pessoa`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                dadosPessoa
                            )
                    }
                );


            const resultado =
                await resposta.json();


            if (!resposta.ok) {

                mostrarAviso(
                    resultado.mensagem ||
                    'Erro ao inserir pessoa.'
                );

                return;
            }


            /*
             * Só enviamos a imagem depois
             * que a pessoa foi criada.
             */

            const imagemOK =
                await uploadImagemParaServidor(id);


            if (!imagemOK) {
                return;
            }


            mostrarAviso(
                'Pessoa cadastrada com sucesso!'
            );
        }


        /* =========================
           ALTERAR
           ========================= */

        else if (oQueEstaFazendo === 'alterando') {

            const resposta =
                await fetch(
                    `${URL_API}/pessoa/${id}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                nome: nome,
                                email: email,
                                telefone: telefone
                            })
                    }
                );


            const resultado =
                await resposta.json();


            if (!resposta.ok) {

                mostrarAviso(
                    resultado.mensagem ||
                    'Erro ao alterar pessoa.'
                );

                return;
            }


            /*
             * Imagem é opcional na alteração.
             */

            const imagemOK =
                await uploadImagemParaServidor(id);


            if (!imagemOK) {
                return;
            }


            mostrarAviso(
                'Pessoa alterada com sucesso!'
            );
        }


        /* =========================
           EXCLUIR
           ========================= */

        else if (oQueEstaFazendo === 'excluindo') {

            const resposta =
                await fetch(
                    `${URL_API}/pessoa/${id}`,
                    {
                        method: 'DELETE'
                    }
                );


            const resultado =
                await resposta.json();


            if (!resposta.ok) {

                mostrarAviso(
                    resultado.mensagem ||
                    'Erro ao excluir pessoa.'
                );

                return;
            }


            carregarImagem(null);


            mostrarAviso(
                'Pessoa excluída com sucesso!'
            );
        }


        else {

            mostrarAviso(
                'Selecione uma operação antes de salvar.'
            );

            return;
        }


        /*
         * Depois de qualquer operação,
         * volta ao estado inicial.
         */

        limparCampos();

        await listarPessoas();


    } catch (erro) {

        console.error(
            'Erro ao salvar:',
            erro
        );

        mostrarAviso(
            'Erro de comunicação com o servidor.'
        );
    }
}


/* =========================
   CARREGAR PESSOA DA LISTA
   ========================= */

async function carregarPessoa(id) {

    document
        .getElementById('inputId_pessoa')
        .value = id;


    await procurar();
}


/* =========================
   CANCELAR
   ========================= */

function cancelarOperacao() {

    limparCampos();

    mostrarAviso(
        'Operação cancelada. Informe o ID e clique em Procurar.'
    );
}


/* =========================
   LIMPAR CAMPOS
   ========================= */

function limparCampos() {

    pessoa = null;

    oQueEstaFazendo = '';


    document
        .getElementById('inputId_pessoa')
        .value = '';


    limparCamposDados();


    document
        .getElementById('inputImagem')
        .value = '';


    carregarImagem(null);


    bloquearAtributos(true);


    /*
     * Estado inicial:
     *
     * Procurar = aparece
     * Inserir = não aparece
     * Alterar = não aparece
     * Excluir = não aparece
     * Salvar = não aparece
     * Cancelar = não aparece
     */

    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );
}


/* =========================
   LIMPAR DADOS
   ========================= */

function limparCamposDados() {

    document
        .getElementById('inputNome_pessoa')
        .value = '';


    document
        .getElementById('inputEmail_pessoa')
        .value = '';


    document
        .getElementById('inputTelefone_pessoa')
        .value = '';
}


/* =========================
   BLOQUEAR ATRIBUTOS
   ========================= */

function bloquearAtributos(soLeitura) {

    /*
     * ID:
     * true  -> readonly
     * false -> editável
     */

    document
        .getElementById('inputId_pessoa')
        .readOnly = !soLeitura;


    /*
     * Dados:
     * true  -> bloqueados
     * false -> editáveis
     */

    document
        .getElementById('inputNome_pessoa')
        .readOnly = soLeitura;


    document
        .getElementById('inputEmail_pessoa')
        .readOnly = soLeitura;


    document
        .getElementById('inputTelefone_pessoa')
        .readOnly = soLeitura;
}


/* =========================
   VISIBILIDADE DOS BOTÕES
   ========================= */

function visibilidadeDosBotoes(
    btP,
    btI,
    btA,
    btE,
    btS
) {

    document
        .getElementById('btProcurar')
        .style.display = btP;


    document
        .getElementById('btInserir')
        .style.display = btI;


    document
        .getElementById('btAlterar')
        .style.display = btA;


    document
        .getElementById('btExcluir')
        .style.display = btE;


    document
        .getElementById('btSalvar')
        .style.display = btS;


    document
        .getElementById('btCancelar')
        .style.display = btS;
}


/* =========================
   AVISOS
   ========================= */

function mostrarAviso(mensagem) {

    document
        .getElementById('divAviso')
        .innerText = mensagem;
}