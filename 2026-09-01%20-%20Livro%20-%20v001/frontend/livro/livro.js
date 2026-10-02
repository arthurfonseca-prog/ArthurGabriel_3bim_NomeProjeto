const URL_API = 'http://localhost:3001';

const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let livro = null;


// ======================================================
// INICIALIZAÇÃO
// ======================================================

async function inicializar() {

    // Primeiro bloqueia os dados do livro
    bloquearAtributos(true);

    // O ID precisa estar liberado para fazer a primeira procura
    document
        .getElementById("inputId_livro")
        .readOnly = false;

    await carregarEditoras();
    await carregarGeneros();
    await listar();

    carregarImagem(null);

    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );

    mostrarAviso("Informe o ID e clique em Procure");
}


// ======================================================
// CARREGAR EDITORAS
// ======================================================

async function carregarEditoras() {

    const select = document.getElementById("selectId_editora");

    try {

        const resposta = await fetch(
            `${URL_API}/editora/listar`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar editoras.");
        }

        const editoras = await resposta.json();

        select.innerHTML =
            '<option value="">-- Selecione uma Editora --</option>';

        editoras.forEach(editora => {

            const option = document.createElement("option");

            option.value = editora.id_editora;

            option.textContent =
                `${editora.id_editora} - ${editora.nome}`;

            select.appendChild(option);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar editoras:",
            erro
        );

        select.innerHTML =
            '<option value="">Erro ao carregar editoras</option>';
    }
}


// ======================================================
// CARREGAR GÊNEROS
// ======================================================

async function carregarGeneros() {

    const select = document.getElementById("selectId_genero");

    try {

        const resposta = await fetch(
            `${URL_API}/genero/listar`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar gêneros.");
        }

        const generos = await resposta.json();

        select.innerHTML =
            '<option value="">-- Selecione um Gênero --</option>';

        generos.forEach(genero => {

            const option = document.createElement("option");

            option.value = genero.id_genero;

            option.textContent =
                `${genero.id_genero} - ${genero.nome}`;

            select.appendChild(option);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar gêneros:",
            erro
        );

        select.innerHTML =
            '<option value="">Erro ao carregar gêneros</option>';
    }
}


// ======================================================
// CARREGAR IMAGEM DO LIVRO
// ======================================================

function carregarImagem(id) {

    const img =
        document.getElementById('imgLivro');

    if (!id) {

        img.src =
            `${URL_API}/imagens/silhueta.png`;

        return;
    }

    img.src =
        `${URL_API}/imagens/livros/${id}.png?t=${new Date().getTime()}`;

    img.onerror = () => {

        img.src =
            `${URL_API}/imagens/silhueta.png`;

    };
}


// ======================================================
// ESCOLHER IMAGEM
// ======================================================

function acionarUpload() {

    if (
        oQueEstaFazendo !== "inserindo" &&
        oQueEstaFazendo !== "alterando"
    ) {

        mostrarAviso(
            "Clique em Inserir ou Alterar primeiro para escolher uma imagem."
        );

        return;
    }

    document
        .getElementById("inputImagem")
        .click();
}


// ======================================================
// PRÉ-VISUALIZAÇÃO DA IMAGEM
// ======================================================

function previewImagem() {

    const input =
        document.getElementById("inputImagem");

    if (input.files.length > 0) {

        const url =
            URL.createObjectURL(input.files[0]);

        document
            .getElementById("imgLivro")
            .src = url;

        mostrarAviso(
            "Imagem escolhida! Clique em Salvar para concluir."
        );
    }
}


// ======================================================
// ENVIAR IMAGEM PARA O SERVIDOR
// ======================================================

async function uploadImagemParaServidor(id) {

    const input =
        document.getElementById("inputImagem");

    if (input.files.length === 0) {
        return true;
    }

    const formData = new FormData();

    formData.append(
        "imagem",
        input.files[0]
    );

    try {

        const resposta = await fetch(
            `${URL_API}/livro/upload/${id}`,
            {
                method: "POST",
                body: formData
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao enviar imagem."
            );
        }

        return true;

    } catch (erro) {

        console.error(
            "Erro ao enviar imagem:",
            erro
        );

        mostrarAviso(
            "Livro salvo, mas houve um erro ao enviar a imagem."
        );

        return false;
    }
}


// ======================================================
// PROCURAR LIVRO
// ======================================================

async function procure() {

    const id =
        document
            .getElementById("inputId_livro")
            .value
            .trim();


    // ==========================================
    // VERIFICAÇÃO DO ID
    // ==========================================

    if (
        id === "" ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            "Precisa informar um número inteiro."
        );

        document
            .getElementById("inputId_livro")
            .focus();

        return;
    }


    try {

        const resposta = await fetch(
            `${URL_API}/livro/${id}`
        );


        // ==========================================
        // LIVRO ENCONTRADO
        // ==========================================

        if (resposta.ok) {

            const dados = await resposta.json();

            livro = dados;

            mostrarDadosLivro(livro);

            carregarImagem(livro.id_livro);

            visibilidadeDosBotoes(
                'inline',
                'none',
                'inline',
                'inline',
                'none'
            );

            mostrarAviso(
                "Achou no banco de dados. Pode alterar ou excluir."
            );

            return;
        }


        // ==========================================
        // LIVRO NÃO ENCONTRADO
        // ==========================================

        if (resposta.status === 404) {

            livro = null;

            limparCamposLivro(false);

            // Mantém o ID digitado
            document
                .getElementById("inputId_livro")
                .value = id;

            // ID continua liberado
            document
                .getElementById("inputId_livro")
                .readOnly = false;

            carregarImagem(null);

            visibilidadeDosBotoes(
                'inline',
                'inline',
                'none',
                'none',
                'none'
            );

            mostrarAviso(
                "Não achou no banco. Pode inserir esse livro."
            );

            return;
        }


        throw new Error(
            "Erro ao consultar o livro."
        );

    } catch (erro) {

        console.error(
            "Erro ao procurar livro:",
            erro
        );

        mostrarAviso(
            "Erro ao conectar com o servidor."
        );
    }
}


// ======================================================
// INSERIR
// ======================================================

function inserir() {

    oQueEstaFazendo = "inserindo";

    livro = null;

    // Libera os campos
    bloquearAtributos(false);

    // Durante inserção, o ID também pode ser digitado
    document
        .getElementById("inputId_livro")
        .readOnly = false;

    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    mostrarAviso(
        "INSERINDO - Digite os dados, escolha a imagem e clique em Salvar."
    );

    document
        .getElementById("inputTitulo")
        .focus();
}


// ======================================================
// ALTERAR
// ======================================================

function alterar() {

    if (!livro) {

        mostrarAviso(
            "Primeiro procure um livro."
        );

        return;
    }

    oQueEstaFazendo = "alterando";

    // Libera os campos
    bloquearAtributos(false);

    // MAS o ID NÃO pode ser alterado
    document
        .getElementById("inputId_livro")
        .readOnly = true;

    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    mostrarAviso(
        "ALTERANDO - Modifique os dados e clique em Salvar."
    );
}


// ======================================================
// EXCLUIR
// ======================================================

function excluir() {

    if (!livro) {

        mostrarAviso(
            "Primeiro procure um livro."
        );

        return;
    }

    oQueEstaFazendo = "excluindo";

    // Durante exclusão, todos os campos ficam bloqueados
    bloquearAtributos(true);

    // O ID também fica bloqueado
    document
        .getElementById("inputId_livro")
        .readOnly = true;

    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    mostrarAviso(
        "EXCLUINDO - Clique em Salvar para confirmar a exclusão."
    );
}


// ======================================================
// SALVAR
// ======================================================

async function salvar() {

    const id =
        document
            .getElementById("inputId_livro")
            .value
            .trim();


    // ==========================================
    // VALIDAR ID
    // ==========================================

    if (
        id === "" ||
        isNaN(id) ||
        !Number.isInteger(Number(id))
    ) {

        mostrarAviso(
            "O ID do livro precisa ser um número inteiro."
        );

        return;
    }


    // ==========================================
    // EXCLUIR
    // ==========================================

    if (oQueEstaFazendo === "excluindo") {

        try {

            const resposta = await fetch(
                `${URL_API}/livro/${id}`,
                {
                    method: "DELETE"
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Erro ao excluir livro."
                );
            }

            mostrarAviso(
                "Livro excluído com sucesso!"
            );

            limparTudo();

            await listar();

        } catch (erro) {

            console.error(
                "Erro ao excluir livro:",
                erro
            );

            mostrarAviso(
                "Erro ao excluir livro: " +
                erro.message
            );
        }

        return;
    }


    // ==========================================
    // PEGAR DADOS DO FORMULÁRIO
    // ==========================================

    const titulo =
        document
            .getElementById("inputTitulo")
            .value
            .trim();

    const ano =
        document
            .getElementById("inputAno_publicacao")
            .value;

    const sinopse =
        document
            .getElementById("inputSinopse")
            .value
            .trim();

    const id_editora =
        document
            .getElementById("selectId_editora")
            .value;

    const id_genero =
        document
            .getElementById("selectId_genero")
            .value;


    // ==========================================
    // VALIDAÇÕES
    // ==========================================

    if (titulo === "") {

        mostrarAviso(
            "Informe o título do livro."
        );

        return;
    }

    if (ano === "") {

        mostrarAviso(
            "Informe o ano de publicação."
        );

        return;
    }

    if (id_editora === "") {

        mostrarAviso(
            "Selecione uma editora."
        );

        return;
    }

    if (id_genero === "") {

        mostrarAviso(
            "Selecione um gênero."
        );

        return;
    }


    const dadosLivro = {

        id_livro: Number(id),

        titulo: titulo,

        ano_publicacao: Number(ano),

        sinopse: sinopse,

        id_editora: Number(id_editora),

        id_genero: Number(id_genero)
    };


    // ==========================================
    // INSERIR / ALTERAR
    // ==========================================

    try {

        let resposta;


        // --------------------------------------
        // CREATE
        // --------------------------------------

        if (oQueEstaFazendo === "inserindo") {

            resposta = await fetch(
                `${URL_API}/livro`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        dadosLivro
                    )
                }
            );
        }


        // --------------------------------------
        // UPDATE
        // --------------------------------------

        else if (oQueEstaFazendo === "alterando") {

            resposta = await fetch(
                `${URL_API}/livro/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        dadosLivro
                    )
                }
            );
        }


        // --------------------------------------
        // NENHUMA OPERAÇÃO
        // --------------------------------------

        else {

            mostrarAviso(
                "Procure um livro ou clique em Inserir primeiro."
            );

            return;
        }


        const dados = await resposta.json();


        // ==========================================
        // VERIFICAR RESPOSTA
        // ==========================================

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Erro ao salvar livro."
            );
        }


        // ==========================================
        // ENVIAR IMAGEM
        // ==========================================

        const imagemEnviada =
            await uploadImagemParaServidor(id);


        // ==========================================
        // FINALIZAR
        // ==========================================

        if (imagemEnviada) {

            mostrarAviso(
                oQueEstaFazendo === "inserindo"
                    ? "Livro cadastrado com sucesso!"
                    : "Livro alterado com sucesso!"
            );
        }


        limparTudo();

        await listar();

    } catch (erro) {

        console.error(
            "Erro ao salvar livro:",
            erro
        );

        mostrarAviso(
            "Erro ao salvar: " +
            erro.message
        );
    }
}


// ======================================================
// LISTAR LIVROS
// ======================================================

async function listar() {

    try {

        const resposta = await fetch(
            `${URL_API}/livro/listar`
        );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar livros."
            );
        }

        const livros = await resposta.json();

        mostrarLivros(livros);

    } catch (erro) {

        console.error(
            "Erro ao listar livros:",
            erro
        );

        document
            .getElementById("outputSaida")
            .innerHTML =
                "<p>Servidor offline ou erro ao carregar livros.</p>";
    }
}


// ======================================================
// MOSTRAR LIVROS
// ======================================================

function mostrarLivros(livros) {

    const saida =
        document.getElementById("outputSaida");

    saida.innerHTML = "";


    if (!Array.isArray(livros) || livros.length === 0) {

        saida.innerHTML =
            "<p>Nenhum livro cadastrado.</p>";

        return;
    }


    livros.forEach(livro => {

        const card =
            document.createElement("article");

        card.classList.add("card-livro");


        // ==========================================
        // IMAGEM
        // ==========================================

        let caminhoImagem;

        if (livro.imagem) {

            if (
                livro.imagem.startsWith("http://") ||
                livro.imagem.startsWith("https://")
            ) {

                caminhoImagem = livro.imagem;

            } else if (
                livro.imagem.startsWith("/imagens/")
            ) {

                caminhoImagem =
                    `${URL_API}${livro.imagem}`;

            } else {

                caminhoImagem =
                    `${URL_API}/${livro.imagem}`;
            }

        } else {

            caminhoImagem = SILHUETA_URL;
        }


        // ==========================================
        // CARD
        // ==========================================

        card.innerHTML = `

            <img
                src="${caminhoImagem}"
                alt="Capa do livro ${livro.titulo}"
                onerror="this.src='${SILHUETA_URL}'"
            >

            <div>

                <h4>
                    ${livro.titulo}
                </h4>

                <p>
                    <strong>ID:</strong>
                    ${livro.id_livro}
                </p>

                <p>
                    <strong>Ano:</strong>
                    ${livro.ano_publicacao}
                </p>

                <p>
                    <strong>Sinopse:</strong>
                    ${livro.sinopse || "Não cadastrada."}
                </p>

            </div>
        `;


        saida.appendChild(card);
    });
}


// ======================================================
// MOSTRAR DADOS DO LIVRO
// ======================================================

function mostrarDadosLivro(livro) {

    document
        .getElementById("inputId_livro")
        .value = livro.id_livro;

    document
        .getElementById("inputTitulo")
        .value = livro.titulo || "";

    document
        .getElementById("inputAno_publicacao")
        .value = livro.ano_publicacao || "";

    document
        .getElementById("inputSinopse")
        .value = livro.sinopse || "";

    document
        .getElementById("selectId_editora")
        .value = livro.id_editora || "";

    document
        .getElementById("selectId_genero")
        .value = livro.id_genero || "";

    // Depois de mostrar os dados,
    // tudo fica bloqueado até clicar em Alterar.
    bloquearAtributos(true);

    // O ID fica bloqueado porque o livro já foi encontrado.
    document
        .getElementById("inputId_livro")
        .readOnly = true;
}


// ======================================================
// LIMPAR CAMPOS
// ======================================================

function limparCamposLivro(limparId = true) {

    if (limparId) {

        document
            .getElementById("inputId_livro")
            .value = "";
    }

    document
        .getElementById("inputTitulo")
        .value = "";

    document
        .getElementById("inputAno_publicacao")
        .value = "";

    document
        .getElementById("inputSinopse")
        .value = "";

    document
        .getElementById("selectId_editora")
        .value = "";

    document
        .getElementById("selectId_genero")
        .value = "";

    document
        .getElementById("inputImagem")
        .value = "";
}


// ======================================================
// LIMPAR TUDO
// ======================================================

function limparTudo() {

    livro = null;

    oQueEstaFazendo = "";

    limparCamposLivro(true);

    bloquearAtributos(true);

    // Depois de limpar, o ID precisa voltar a
    // ficar disponível para uma nova procura.
    document
        .getElementById("inputId_livro")
        .readOnly = false;

    carregarImagem(null);

    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );
}


// ======================================================
// CANCELAR OPERAÇÃO
// ======================================================

function cancelarOperacao() {

    limparTudo();

    mostrarAviso(
        "Operação cancelada."
    );
}


// ======================================================
// BLOQUEAR / DESBLOQUEAR CAMPOS
// ======================================================

function bloquearAtributos(soLeitura) {

    // O ID é controlado separadamente.
    // Isso permite que ele fique:
    // - liberado na procura;
    // - bloqueado durante alteração/exclusão;
    // - liberado durante inserção.

    document
        .getElementById("inputTitulo")
        .readOnly = soLeitura;

    document
        .getElementById("inputAno_publicacao")
        .readOnly = soLeitura;

    document
        .getElementById("inputSinopse")
        .readOnly = soLeitura;

    document
        .getElementById("selectId_editora")
        .disabled = soLeitura;

    document
        .getElementById("selectId_genero")
        .disabled = soLeitura;
}


// ======================================================
// VISIBILIDADE DOS BOTÕES
// ======================================================

function visibilidadeDosBotoes(
    btProcure,
    btInserir,
    btAlterar,
    btExcluir,
    btSalvar
) {

    document
        .getElementById("btProcure")
        .style.display = btProcure;

    document
        .getElementById("btInserir")
        .style.display = btInserir;

    document
        .getElementById("btAlterar")
        .style.display = btAlterar;

    document
        .getElementById("btExcluir")
        .style.display = btExcluir;

    document
        .getElementById("btSalvar")
        .style.display = btSalvar;

    document
        .getElementById("btCancelar")
        .style.display = btSalvar;
}


// ======================================================
// MOSTRAR AVISO
// ======================================================

function mostrarAviso(mensagem) {

    document
        .getElementById("divAviso")
        .innerHTML = mensagem;
}