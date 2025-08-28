# Robo-NFE

Este é um robô criado para automatizar o download de arquivos XML de notas fiscais eletrônicas (NFE) a partir de um arquivo de texto.

## Como Funciona

O robô lê as chaves de acesso de um arquivo `chaves.txt`, pesquisa cada uma em um site específico e baixa o arquivo XML correspondente.

## Pré-requisitos

Antes de usar o robô, certifique-se de ter o **Node.js** instalado.

- **Node.js**: [Link para download](https://nodejs.org/en/download/)

## Instalação

1.  Clone este repositório para o seu computador.
2.  Abra o terminal na pasta do projeto.
3.  Instale as dependências com o seguinte comando:
    ```bash
    npm install
    ```

## Como Usar

1.  Abra o arquivo `chaves.txt` e adicione as chaves de acesso das notas fiscais, **uma por linha**.
2.  No terminal, execute o robô com o comando:
    ```bash
    node index.js
    ```
3.  O robô perguntará se as notas são de "entradas" ou "saidas". Digite a opção e pressione `Enter`.
4.  O robô irá processar as chaves e salvar os arquivos XML na pasta correspondente (`XML_ENTRADAS` ou `XML_SAIDAS`).

## Gerando um Executável

Para gerar um arquivo executável para Windows, siga estes passos:

1.  Instale o `pkg` globalmente no seu computador:
    ```bash
    npm install -g pkg
    ```
2.  Rode o comando para gerar o executável:
    ```bash
    npm run build
    ```
3.  O arquivo executável será criado na pasta do projeto. Lembre-se de que você precisará **copiar o executável junto com a pasta do navegador** (`node_modules/puppeteer/.local-chromium/`) para que ele funcione em outras máquinas.
