# Lumi - Teste Técnico Desenvolvedor Full Stack

Este projeto foi desenvolvido como parte do **Teste Técnico para Desenvolvedor Full Stack Pleno** da Lumi. O desafio teve como objetivo avaliar as habilidades do candidato no desenvolvimento full-stack, utilizando React, Node.js, TypeScript e PostgreSQL.

## Descrição do Projeto

O desafio consistiu em extrair dados relevantes de um conjunto de faturas de energia elétrica fornecidas, armazenar essas informações em um banco de dados PostgreSQL estruturado e exibi-las em uma aplicação web por meio de uma API.

**Nota**: O trabalho submetido para este teste não será utilizado para fins comerciais ou integrado aos produtos da Lumi. Seu propósito é exclusivamente avaliativo.

## Tecnologias Utilizadas

- **Front-end**: React, TypeScript
- **Back-end**: Node.js (Express)
- **Banco de Dados**: PostgreSQL
- **API**: Construída com Express
- **Bibliotecas**: Axios, React Icons, Supabase, Recharts

## Funcionalidades

1. **Extração de Dados**: Parseamento das faturas de energia elétrica fornecidas para extrair informações chave.
2. **Organização de Dados**: Armazenamento dos dados extraídos em um banco de dados PostgreSQL.
3. **Visualização de Dados**: Exibição das informações de consumo e compensação de energia em um dashboard web.
4. **Design Responsivo**: A aplicação foi projetada para funcionar em diferentes tamanhos de tela.

## Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/Robetjunior/Lumi-sChallenge.git
cd Lumi-sChallenge
```

### 2. Instalar Dependências
```bash
npm install
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto e insira as seguintes variáveis:
```bash
REACT_APP_SUPABASE_URL='https://yhivluwnxpbqwntxnmtn.supabase.co'
REACT_APP_SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaXZsdXdueHBicXdudHhubXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjk2NjksImV4cCI6MjA0NDc0NTY2OX0.D5513Hj3C-8MWLsDQvXsken8xjI-igdHJqmXNPAVT3Q'
```

### 4. Configurar o Banco de Dados
Execute o seguinte comando para rodar as migrações e configurar o banco de dados
```bash
npm run migrate
```

### 5. Executar o Projeto em Desenvolvimento
```bash
npm start
```

A aplicação estará disponível no navegador em http://localhost:3000.

### 6. Build para Produção
```bash
npm run build
```

### 7. Executar a API
No diretório do backend, execute:

A API rodará na porta 3001.

### Acesso ao Projeto em Produção
Você pode visualizar o projeto rodando no Heroku através deste link:
[Executar o projeto](https://lumi-front-82af2d71e234.herokuapp.com/)

### Acesso a API
Você pode visualizar o projeto rodando no Heroku através deste link:
[Repositório API](https://github.com/Robetjunior/Lumi-sChallenge/)

### Testes
Para rodar os testes, utilize o seguinte comando:
```bash
npm test
```

### Estrutura do Projeto
```bash
frontend-lumi/
├── public/                 # Arquivos públicos
├── src/                    # Código-fonte principal
│   ├── components/         # Componentes React
│   ├── config/             # Configurações 
│   ├── pages/              # Páginas React
│   ├── services/           # Serviços de API
│   ├── styles/             # Styles 
│   index.tsx               # Ponto de entrada da aplicação React
├── .env                    # Variáveis de ambiente
├── package.json            # Gerenciamento de dependências e scripts
├── README.md               # Documentação do projeto
└── tsconfig.json           # Configurações do TypeScript
```

### Autor
José Roberto - [LinkedIn](https://www.linkedin.com/in/jos%C3%A9-roberto-dev/)

```bash
Este arquivo `README.md` cobre os principais tópicos necessários para a documentação do seu projeto, como a instalação, configuração, execução, tecnologias utilizadas, e outras informações relevantes. Certifique-se de ajustar as variáveis de ambiente e os links conforme o necessário.
```

