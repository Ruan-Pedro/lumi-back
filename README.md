# Lumi Back-End

Bem-vindo ao repositório do **Lumi Back-End**, parte do desafio Lumi. Este projeto é construído com Node.js e utiliza PostgreSQL e Redis para gerenciamento de dados.

## Requisitos

Antes de começar, você precisa ter os seguintes softwares instalados em seu sistema:

- [Node.js](https://nodejs.org/en/download/) (v14 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop)

## Instalação

Siga os passos abaixo para configurar o ambiente do backend:

### 1. Clonando o Repositório

Primeiro, clone o repositório em sua máquina local:

```bash
git clone https://github.com/Ruan-Pedro/lumi-back.git
cd lumi-back

````

### 2. Configurando o Docker

Este projeto utiliza Docker para gerenciar os serviços do PostgreSQL e Redis. Certifique-se de que o Docker está instalado e em execução

### 3. Executando os Serviços
Com o arquivo docker-compose.yml configurado, você pode iniciar os serviços com o seguinte comando:

```bash
docker-compose up -d
Isso iniciará os containers do PostgreSQL e Redis em segundo plano. Você pode verificar se estão em execução com:
docker-compose ps
````

### 4. Instalando Dependências
Instale as dependências do projeto usando o npm:

````bash
npm install
````
5. Testando o Ambiente
Após instalar as dependências, você pode executar os testes para garantir que tudo está funcionando corretamente:

````bash
npm test
````
Ou, se você quiser rodar um teste específico:`
````bash
npm run test-server
````
6. Executando o Servidor
Para iniciar o servidor, use o seguinte comando:

````bash
npm start
````
Se você estiver desenvolvendo e quiser recarregar automaticamente as alterações, execute:

````bash
Copiar código
npm run dev
````