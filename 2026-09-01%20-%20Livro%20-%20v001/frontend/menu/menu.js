const URL_API = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', async () => {

    try {

        const resposta = await fetch(`${URL_API}/livro/listar`);

        if (resposta.ok) {
            console.log('Servidor backend conectado com sucesso!');
        }

    } catch (erro) {

        console.warn(
            'Aviso: Não foi possível conectar ao servidor backend em ' + URL_API
        );

    }

});