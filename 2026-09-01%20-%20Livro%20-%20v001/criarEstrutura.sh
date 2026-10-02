#!/bin/bash

# ==============================================================================
# Script para criação da estrutura do novo projeto (MVC + 2 CRUDs)
# ==============================================================================

echo "Criando diretórios do projeto..."

# Estrutura Backend (MVC)
mkdir -p backend/controllers
mkdir -p backend/routes

# Estrutura Frontend
mkdir -p frontend/menu
mkdir -p frontend/produto
mkdir -p frontend/unidade_medida

# Pasta para Imagens
mkdir -p imagens

echo "Criando arquivos do Backend (vazios)..."
touch backend/server.js
touch backend/database.js
touch backend/controllers/produtoController.js
touch backend/controllers/unidadeMedidaController.js
touch backend/routes/produtoRoutes.js
touch backend/routes/unidadeMedidaRoutes.js

echo "Criando arquivos do Frontend (vazios)..."
touch frontend/menu/menu.html
touch frontend/menu/menu.css
touch frontend/menu/menu.js

touch frontend/produto/produto.html
touch frontend/produto/produto.css
touch frontend/produto/produto.js

touch frontend/unidade_medida/unidade_medida.html
touch frontend/unidade_medida/unidade_medida.css
touch frontend/unidade_medida/unidade_medida.js

touch index.html

echo "Criando arquivos de configuração (vazios)..."
touch .env
touch package.json
touch README.md

echo "Estrutura criada com sucesso!"
