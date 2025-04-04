# Lumi - Teste Técnico Desenvolvedor Full Stack (Frontend)

Este projeto foi desenvolvido como parte do **Teste Técnico para Desenvolvedor Full Stack Pleno** da Lumi. O objetivo é demonstrar minhas habilidades no desenvolvimento de uma aplicação web completa, integrando extração, armazenamento e visualização de dados das faturas de energia elétrica.

## Intuito do Projeto

O sistema tem como finalidade:
- **Extrair e Processar Dados**: Capturar informações relevantes de faturas de energia elétrica (como consumo, compensação e valores financeiros).
- **Persistência dos Dados**: Armazenar os dados extraídos em um banco de dados PostgreSQL, utilizando um ORM (Prisma/TypeORM/Sequelize) na camada de back-end.
- **Visualização dos Dados**: Exibir as informações de forma intuitiva e interativa por meio de um dashboard e uma biblioteca de faturas, permitindo o filtro por cliente, período e a realização de downloads das faturas.

## Tecnologias Utilizadas

- **Front-end**: 
  - React com TypeScript
  - React Router para navegação
  - Recharts para visualização de dados (gráficos e cards)
  - React Icons para ícones
  - Axios para requisições à API
- **Back-end** (para a API):
  - Node.js com Express (ou NestJS, conforme a implementação)
  - PostgreSQL para armazenamento dos dados
  - ORM (Prisma/TypeORM/Sequelize) para interação com o banco de dados

## Funcionalidades

- **Dashboard**: 
  - Exibe cards com os totais de energia gerada, consumida, compensada e saldo de créditos.
  - Mostra gráficos interativos que comparam o consumo de energia com a energia compensada e os resultados financeiros (valor faturado vs. economia).
- **Biblioteca de Faturas**: 
  - Permite a visualização e o download das faturas de energia.
  - Disponibiliza filtros por número do cliente e distribuidora, bem como seleção de período.
- **Responsividade**: 
  - A aplicação é responsiva e adapta seu layout para diferentes tamanhos de tela, com destaque para uma experiência mobile aprimorada.

## Tutorial: Como Executar o Projeto

### 1. Clonar o Repositório

```bash
git clone https://github.com/SeuUsuario/SeuRepositorio.git
cd SeuRepositorio
```

### 2. Instalar as Dependências
No diretório do projeto, execute:
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto e configure as variáveis necessárias para conectar com a API e outros serviços (exemplo):

```bash
REACT_APP_SUPABASE_URL='https://yhivluwnxpbqwntxnmtn.supabase.co'
REACT_APP_SUPABASE_KEY='SEU_SUPABASE_KEY_AQUI'
```

### 4. Executar o Projeto em Desenvolvimento
```bash
npm start
```
A aplicação será iniciada e estará disponível no navegador em http://localhost:3000.

### 5. Build para Produção
Para criar uma versão otimizada para produção:

```bash
npm run build
```

### 6. Executar a API (Back-end)
No diretório do back-end (caso separado), instale as dependências, configure as variáveis de ambiente e execute a aplicação:
```bash
npm install
npm run migrate   # para configurar o banco de dados PostgreSQL
npm start    
```

npm install
npm run migrate   # para configurar o banco de dados PostgreSQL
npm start    


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
