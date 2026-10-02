-- =========================================================
-- BOOKSHELF - BANCO DE DADOS
-- =========================================================

-- ---------------------------------------------------------
-- TABELA: AUTOR
-- ---------------------------------------------------------
DROP TABLE IF EXISTS autor, editora, genero, livro, detalhes_livro, avaliacao, livro_autor;
CREATE TABLE autor (
    id_autor INTEGER PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    biografia TEXT,
    foto VARCHAR(255)
);

-- ---------------------------------------------------------
-- TABELA: EDITORA
-- ---------------------------------------------------------

CREATE TABLE editora (
    id_editora INTEGER PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    pais VARCHAR(100),
    site VARCHAR(255),
    logo VARCHAR(255)
);

-- ---------------------------------------------------------
-- TABELA: GENERO
-- ---------------------------------------------------------

CREATE TABLE genero (
    id_genero INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- ---------------------------------------------------------
-- TABELA: LIVRO
-- ---------------------------------------------------------

CREATE TABLE livro (
    id_livro INTEGER PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    ano_publicacao INTEGER,
    sinopse TEXT,
    imagem VARCHAR(255),
    id_editora INTEGER NOT NULL,
    id_genero INTEGER NOT NULL,

    FOREIGN KEY (id_editora)
        REFERENCES editora(id_editora),

    FOREIGN KEY (id_genero)
        REFERENCES genero(id_genero)
);

-- ---------------------------------------------------------
-- TABELA: DETALHES_LIVRO
-- Relacionamento 1:1 com LIVRO
-- ---------------------------------------------------------

CREATE TABLE detalhes_livro (
    id_livro INTEGER PRIMARY KEY,
    isbn VARCHAR(20),
    numero_paginas INTEGER,
    idioma VARCHAR(50),
    formato VARCHAR(50),
    peso INTEGER,

    FOREIGN KEY (id_livro)
        REFERENCES livro(id_livro)
);

-- ---------------------------------------------------------
-- TABELA: AVALIACAO
-- Relacionamento 1:N com LIVRO
-- ---------------------------------------------------------

CREATE TABLE avaliacao (
    id_avaliacao INTEGER PRIMARY KEY,
    nota INTEGER NOT NULL,
    comentario TEXT,
    data_avaliacao DATE,
    id_livro INTEGER NOT NULL,

    FOREIGN KEY (id_livro)
        REFERENCES livro(id_livro)
);

-- ---------------------------------------------------------
-- TABELA: LIVRO_AUTOR
-- Relacionamento N:N entre LIVRO e AUTOR
-- ---------------------------------------------------------

CREATE TABLE livro_autor (
    id_livro INTEGER,
    id_autor INTEGER,

    PRIMARY KEY (id_livro, id_autor),

    FOREIGN KEY (id_livro)
        REFERENCES livro(id_livro),

    FOREIGN KEY (id_autor)
        REFERENCES autor(id_autor)
);


-- =========================================================
-- INSERTS
-- =========================================================

-- ---------------------------------------------------------
-- AUTORES
-- ---------------------------------------------------------

INSERT INTO autor (id_autor, nome, biografia, foto) VALUES
(1, 'Machado de Assis', 'Escritor brasileiro e um dos principais nomes da literatura brasileira.', 'imagens/autores/machado.jpg'),
(2, 'Clarice Lispector', 'Escritora brasileira conhecida por sua literatura introspectiva.', 'imagens/autores/clarice.jpg'),
(3, 'Jorge Amado', 'Escritor brasileiro conhecido por retratar a cultura e a sociedade baiana.', 'imagens/autores/jorge_amado.jpg'),
(4, 'Mary Shelley', 'Escritora inglesa, autora de Frankenstein.', 'imagens/autores/mary_shelley.jpg'),
(5, 'George Orwell', 'Escritor e jornalista britânico.', 'imagens/autores/orwell.jpg'),
(6, 'J. R. R. Tolkien', 'Escritor britânico conhecido por suas obras de fantasia.', 'imagens/autores/tolkien.jpg'),
(7, 'Jane Austen', 'Escritora inglesa conhecida por seus romances.', 'imagens/autores/jane_austen.jpg'),
(8, 'Gabriel García Márquez', 'Escritor colombiano associado ao realismo mágico.', 'imagens/autores/gabriel_garcia.jpg'),
(9, 'José de Alencar', 'Escritor brasileiro representante do romantismo.', 'imagens/autores/jose_alencar.jpg'),
(10, 'Franz Kafka', 'Escritor de língua alemã conhecido por suas narrativas de caráter existencial.', 'imagens/autores/kafka.jpg');


-- ---------------------------------------------------------
-- EDITORAS
-- ---------------------------------------------------------

INSERT INTO editora (id_editora, nome, pais, site, logo) VALUES
(1, 'Companhia das Letras', 'Brasil', 'https://www.companhiadasletras.com.br', 'imagens/editoras/companhia.jpg'),
(2, 'Editora Record', 'Brasil', 'https://www.record.com.br', 'imagens/editoras/record.jpg'),
(3, 'Rocco', 'Brasil', 'https://www.rocco.com.br', 'imagens/editoras/rocco.jpg'),
(4, 'Penguin Books', 'Reino Unido', 'https://www.penguin.co.uk', 'imagens/editoras/penguin.jpg'),
(5, 'HarperCollins', 'Estados Unidos', 'https://www.harpercollins.com', 'imagens/editoras/harpercollins.jpg'),
(6, 'DarkSide Books', 'Brasil', 'https://www.darksidebooks.com.br', 'imagens/editoras/darkside.jpg'),
(7, 'Intrínseca', 'Brasil', 'https://intrinseca.com.br', 'imagens/editoras/intrinseca.jpg'),
(8, 'Aleph', 'Brasil', 'https://editoraaleph.com.br', 'imagens/editoras/aleph.jpg'),
(9, 'Zahar', 'Brasil', 'https://www.zahar.com.br', 'imagens/editoras/zahar.jpg'),
(10, 'Todavia', 'Brasil', 'https://todavialivros.com.br', 'imagens/editoras/todavia.jpg');


-- ---------------------------------------------------------
-- GENEROS
-- ---------------------------------------------------------

INSERT INTO genero (id_genero, nome, descricao) VALUES
(1, 'Romance', 'Narrativas centradas em relações humanas e acontecimentos da vida dos personagens.'),
(2, 'Fantasia', 'Narrativas que apresentam elementos mágicos ou sobrenaturais.'),
(3, 'Ficção Científica', 'Obras que exploram ciência, tecnologia e possíveis futuros.'),
(4, 'Terror', 'Narrativas destinadas a provocar tensão, medo ou suspense.'),
(5, 'Drama', 'Obras centradas em conflitos e experiências humanas.'),
(6, 'Aventura', 'Narrativas marcadas por viagens, desafios e acontecimentos extraordinários.'),
(7, 'Distopia', 'Obras que apresentam sociedades imaginárias marcadas por problemas políticos ou sociais.'),
(8, 'Realismo Mágico', 'Narrativas que misturam acontecimentos cotidianos e elementos fantásticos.'),
(9, 'Ficção', 'Narrativas literárias baseadas em acontecimentos e personagens fictícios.'),
(10, 'Clássico', 'Obras reconhecidas por sua importância e influência literária.');


-- ---------------------------------------------------------
-- LIVROS
-- ---------------------------------------------------------

INSERT INTO livro
(id_livro, titulo, ano_publicacao, sinopse, imagem, id_editora, id_genero)
VALUES
(1, 'Dom Casmurro', 1899,
 'Romance que acompanha as memórias de Bentinho e sua relação com Capitu.',
 'imagens/livros/dom_casmurro.jpg', 1, 1),

(2, 'A Hora da Estrela', 1977,
 'Narrativa que acompanha a trajetória de Macabéa, uma jovem nordestina no Rio de Janeiro.',
 'imagens/livros/hora_da_estrela.jpg', 2, 5),

(3, 'Capitães da Areia', 1937,
 'Romance que retrata a vida de um grupo de meninos abandonados em Salvador.',
 'imagens/livros/capitaes_da_areia.jpg', 1, 5),

(4, 'Frankenstein', 1818,
 'Um cientista cria uma criatura e precisa lidar com as consequências de sua experiência.',
 'imagens/livros/frankenstein.jpg', 6, 4),

(5, '1984', 1949,
 'Uma sociedade controlada por um regime totalitário acompanha constantemente seus cidadãos.',
 'imagens/livros/1984.jpg', 7, 7),

(6, 'O Senhor dos Anéis', 1954,
 'Uma jornada é iniciada para destruir um poderoso artefato capaz de ameaçar toda a Terra-média.',
 'imagens/livros/senhor_dos_aneis.jpg', 3, 2),

(7, 'Orgulho e Preconceito', 1813,
 'Elizabeth Bennet enfrenta questões familiares e sociais enquanto conhece Mr. Darcy.',
 'imagens/livros/orgulho_preconceito.jpg', 4, 1),

(8, 'Cem Anos de Solidão', 1967,
 'A história de várias gerações da família Buendía na cidade fictícia de Macondo.',
 'imagens/livros/cem_anos_solidao.jpg', 5, 8),

(9, 'Iracema', 1865,
 'Romance indianista que narra a relação entre Iracema e Martim.',
 'imagens/livros/iracema.jpg', 9, 1),

(10, 'A Metamorfose', 1915,
 'Um homem acorda transformado em um inseto e passa a enfrentar uma nova realidade.',
 'imagens/livros/metamorfose.jpg', 10, 9);


-- ---------------------------------------------------------
-- DETALHES DOS LIVROS
-- ---------------------------------------------------------

INSERT INTO detalhes_livro
(id_livro, isbn, numero_paginas, idioma, formato, peso)
VALUES
(1, '9780000000001', 256, 'Português', 'Capa comum', 300),
(2, '9780000000002', 88, 'Português', 'Capa comum', 150),
(3, '9780000000003', 280, 'Português', 'Capa comum', 350),
(4, '9780000000004', 280, 'Português', 'Capa dura', 450),
(5, '9780000000005', 416, 'Português', 'Capa comum', 500),
(6, '9780000000006', 1216, 'Português', 'Capa comum', 1000),
(7, '9780000000007', 424, 'Português', 'Capa comum', 550),
(8, '9780000000008', 448, 'Português', 'Capa comum', 600),
(9, '9780000000009', 120, 'Português', 'Capa comum', 180),
(10, '9780000000010', 96, 'Português', 'Capa comum', 160);


-- ---------------------------------------------------------
-- AVALIAÇÕES
-- ---------------------------------------------------------

INSERT INTO avaliacao
(id_avaliacao, nota, comentario, data_avaliacao, id_livro)
VALUES
(1, 5, 'Uma obra marcante da literatura brasileira.', '2026-09-01', 1),
(2, 4, 'Narrativa curta, mas muito profunda.', '2026-09-02', 2),
(3, 5, 'Retrato muito interessante da sociedade.', '2026-09-03', 3),
(4, 4, 'Uma história clássica do terror e da ficção científica.', '2026-09-04', 4),
(5, 5, 'Uma distopia que apresenta várias questões sociais.', '2026-09-05', 5),
(6, 5, 'Um universo de fantasia extremamente detalhado.', '2026-09-06', 6),
(7, 4, 'Romance divertido e com personagens marcantes.', '2026-09-07', 7),
(8, 5, 'Uma narrativa complexa e cheia de simbolismos.', '2026-09-08', 8),
(9, 4, 'Importante obra do romantismo brasileiro.', '2026-09-09', 9),
(10, 5, 'Uma narrativa curta e bastante peculiar.', '2026-09-10', 10);


-- ---------------------------------------------------------
-- RELACIONAMENTO LIVRO x AUTOR
-- ---------------------------------------------------------

INSERT INTO livro_autor (id_livro, id_autor) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);