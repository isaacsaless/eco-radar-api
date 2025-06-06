<div align="center">
    <a href="https://eco-radar.vercel.app">
        <img src="https://i.imgur.com/WeHCYZx.png" alt="EcoRadar logo" height="140" />
    </a>
    <h5 align="center">
        A API pública do projeto EcoRadar, uma solução para combate a focos de incêndios.
    </h5>
    <p align="center">
        &middot;
        <a target="_blank" href="https://eco-radar.vercel.app">Site</a>
        &middot;
    </p>
</div>

## Sobre
<p>
  A API pública do EcoRadar foi desenvolvida com o objetivo de disponibilizar dados ambientais relevantes de forma acessível, rápida e confiável. Ela atua como o backend do projeto EcoRadar, fornecendo informações essenciais sobre focos de incêndio no Brasil, extraídas de fontes confiáveis como o NASA.
  A API foi construída com Node.js, TypeScript e o framework Fastify, e está encapsulada em um ambiente Docker para facilitar sua distribuição e execução. Ela está pronta para ser consumida por qualquer cliente frontend, app mobile ou sistema que precise desses dados ambientais.
</p>  

## Feito com
* <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white"/>
* <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
* <img src="https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white"/>
<br>

## Utilização

### Configuração Local com Docker

Para executar a aplicação localmente, siga os passos abaixo:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/isaacsaless/eco-radar-api.git
   cd eco-radar-api
   ```

2. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.template` para `.env`
   - Preencha todas as variáveis de ambiente necessárias no arquivo `.env`

3. **Execute com Docker**
   ```bash
   docker build -t eco-radar-api .
   docker run -p 3000:3000 --env-file .env eco-radar-api
   ```

A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada).

## Contribuições
### Você pode contribuir com este código enviando um pull request. Basta seguir estas instruções:
<br>

1. Faça um fork desse repositório;
2. Crie uma nova branch com sua funcionalidade: (`git checkout -b feature/NovaFeature`);
3. Faça um commit das suas mudanças: (`git commit -m 'Adicionada NovaFeature`);
4. Realize um push para o repositório original: (`git push origin feature/NovaFeature`);
5. Crie um pull request.

<p>E está pronto, simples assim! 🎉</p>

## Licença

Distribuído sob a Licença MIT. Consulte `LICENSE.txt` para mais informações.

## Contato

Isaac Sales - [isaac-sales](https://www.linkedin.com/in/isaac-sales/) - isaacnascimentosales@gmail.com

Link do projeto: [https://github.com/isaacsaless/eco-radar-api](https://github.com/isaacsaless/eco-radar-api)

## Agradecimentos

* [MIT License](https://opensource.org/license/mit)
* [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)
