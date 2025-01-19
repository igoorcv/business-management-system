# business-management-system 🍕
Um sistema web para gerenciar vendas de uma pizzaria, incluindo controle de clientes, produtos e pedidos.

## Tecnologias Utilizadas
- **Back-End:** Flask (Python)
- **Front-End:** React + Tailwind CSS
- **Banco de Dados:** PostgreSQL
- **Hospedagem:** Nuvem gratuita (Render, Fly.io, ou PythonAnywhere)

## Funcionalidades
- CRUD de clientes.
- CRUD de produtos.
- CRUD de pedidos no balcão e na mesa.
- Compatível com PC e smartphones (PWA).

## Como Executar Localmente
### Pré-requisitos
- Python 3.9+
- Node.js 16+
- PostgreSQL

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pizzaria-system.git
   cd pizzaria-system 

## Configuração do ambiente de DEV
   1. Baixar as ferramentas necessárias:
      * Node.js 16+
      * Python 3.9+
      * PostgreSQL
      * DBeaver

   2. Configuração completa do backend
      * Acessar pasta /backend
      * Rodar os seguintes comandos no Windows: 
         - python -m venv venv
         - venv\Scripts\activate
         - pip install flask flask-cors flask-sqlalchemy psycopg2-binary
         - pip freeze > requirements.txt
         - pip install -r requirements.txt
         - python run.py (Inicialização do servidor Python)

   3. Configuração completa do frontend
      * Acessar pasta /business-management-system
      * Rodar os seguintes comandos no Windows:
         - npx create-react-app frontend --
         - Acessar pasta /frontend
         - npm install
         - npm install -D tailwindcss postcss autoprefixer
         - npx tailwindcss init
         - npm start
         - npm init -y
         - npm install axios
         - npm install react-scripts --save
         - npm start (Inicialização do servidor React)


   4. Conexão entre backend e frontend
      * 


   5. Desativação do ambiente virtual
      * deactivate 


## Configuração do back-end

## Conexão entre back-end e front-end

