# InvestSavy - Portal de Notícias Financeiras

Portal moderno de notícias financeiras e análises de mercado, desenvolvido com HTML, CSS e JavaScript puro, utilizando Jekyll para gerenciamento de conteúdo.

## Características

- Design moderno e responsivo
- Atualizações em tempo real de cotações do mercado
- Sistema de notícias baseado em Markdown
- Layout limpo e profissional
- Integração com API de dados financeiros
- Newsletter para conteúdo exclusivo

## Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS)
- JavaScript (ES6+)
- Jekyll (para gerenciamento de conteúdo)
- Markdown (para conteúdo das notícias)
- Alpha Vantage API (para dados do mercado)

## Estrutura do Projeto

```
investsavy/
├── _config.yml          # Configurações do Jekyll
├── _posts/             # Posts em Markdown
├── _layouts/           # Templates de layout
├── assets/
│   ├── css/           # Estilos CSS
│   ├── js/            # Scripts JavaScript
│   └── images/        # Imagens do site
├── index.html         # Página inicial
└── README.md          # Documentação
```

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/investsavy.git
cd investsavy
```

2. Instale as dependências do Jekyll:

```bash
bundle install
```

3. Configure sua chave API do Alpha Vantage:

   - Obtenha uma chave em https://www.alphavantage.co/
   - Substitua `YOUR_API_KEY` em `assets/js/markets.js`

4. Inicie o servidor local:

```bash
bundle exec jekyll serve
```

## Desenvolvimento

### Adicionando Novas Notícias

1. Crie um novo arquivo `.md` em `_posts/`
2. Use o seguinte formato para o nome do arquivo: `YYYY-MM-DD-titulo-da-noticia.md`
3. Adicione o front matter necessário:

```yaml
---
layout: post
title: 'Título da Notícia'
date: YYYY-MM-DD HH:MM:SS -0300
categories: [categoria]
tags: [tag1, tag2]
author: 'Nome do Autor'
image: /assets/images/posts/imagem.jpg
excerpt: 'Resumo da notícia'
---
```

### Personalizando o Layout

- Modifique os estilos em `assets/css/style.css`
- Ajuste os templates em `_layouts/`
- Atualize as configurações em `_config.yml`

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

- Website: [investsavy.com.br](https://investsavy.com.br)
- Email: contato@investsavy.com.br
- Twitter: [@investsavy](https://twitter.com/investsavy)
