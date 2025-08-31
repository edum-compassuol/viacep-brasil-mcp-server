# ViaCEP Brasil MCP Server

O ViaCEP Brasil MCP Server conecta ferramentas de IA diretamente à API ViaCEP, permitindo consultas de endereços brasileiros através do CEP ou busca de CEPs através de endereços. Esta integração permite que agentes de IA, assistentes e chatbots consultem informações de endereços do Brasil por meio de interações em linguagem natural.

## Casos de Uso

- **Consulta de Endereços**: Obtenha informações detalhadas de endereços fornecendo um CEP.
- **Busca de CEPs**: Encontre CEPs a partir de informações parciais de endereços (UF, cidade e logradouro).
- **Validação de Endereços**: Verifique se um CEP existe e obtenha os detalhes completos do endereço.
- **Integração com Sistemas**: Facilite a integração de dados de endereço em aplicações que utilizam IA.

## Ferramentas Disponíveis

O servidor disponibiliza duas ferramentas principais:

### getAddressByCEP

Obtém informações de endereço a partir de um CEP.

**Parâmetros:**
- `cep` (string): O código postal de 8 dígitos, sem hífen ou outros caracteres especiais.

**Exemplo de Uso:**
```json
{
  "cep": "01001000"
}
```

**Exemplo de Resposta:**
```json
{
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "complemento": "lado ímpar",
  "bairro": "Sé",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

### getCEPByAddress

Busca CEPs com base em informações de endereço.

**Parâmetros:**
- `uf` (string): Código de duas letras do estado (ex: "SP").
- `cidade` (string): Nome da cidade.
- `logradouro` (string): Nome da rua, avenida, praça, etc.

**Exemplo de Uso:**
```json
{
  "uf": "RS",
  "cidade": "Porto Alegre",
  "logradouro": "Domingos"
}
```

**Exemplo de Resposta:**
```json
[
  {
    "cep": "91420-270",
    "logradouro": "Rua São Domingos",
    "bairro": "Bom Jesus",
    "localidade": "Porto Alegre",
    "uf": "RS",
    ...
  },
  {
    "cep": "91040-000",
    "logradouro": "Rua Domingos Rubbo",
    "bairro": "Cristo Redentor",
    "localidade": "Porto Alegre",
    "uf": "RS",
    ...
  },
  ...
]
```

## Recursos

- **README**: Acesse esta documentação através do recurso `readme://viacep`.

---

## Instalação e Configuração

O ViaCEP Brasil MCP Server pode ser executado de várias formas, dependendo das suas necessidades.

### Pré-requisitos

- Node.js v18+ (para execução direta)
- Docker (para execução via contêiner)

### Instalação via NPX

A forma mais simples de usar o servidor:

```bash
npx viacep-brasil-mcp-server
```

### Instalação Local

Clone este repositório e execute:

```bash
# Instalar dependências
npm install

# Construir o servidor
npm run build

# Iniciar o servidor
node build/index.js
```

### Instalação via Docker

#### Usando a Imagem Pré-construída

```bash
docker run -i --rm ghcr.io/seu-usuario/viacep-brasil-mcp-server
```

#### Construindo sua Própria Imagem

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/viacep-brasil-mcp-server.git
cd viacep-brasil-mcp-server

# Construa a imagem Docker
docker build -t viacep-brasil-mcp-server .

# Execute o contêiner
docker run -i --rm viacep-brasil-mcp-server
```

### Configuração em Aplicações MCP

#### VS Code com GitHub Copilot

Adicione o seguinte bloco JSON às suas configurações MCP:

```json
{
  "servers": {
    "viacep": {
      "command": "npx",
      "args": ["viacep-brasil-mcp-server"]
    }
  }
}
```

#### VS Code com Docker

```json
{
  "servers": {
    "viacep": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "viacep-brasil-mcp-server"
      ]
    }
  }
}
```

#### Claude Desktop / Claude Web / Claude Code

Adicione o servidor ao arquivo de configuração:

No macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
No Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "viacep": {
      "command": "/caminho/para/viacep-brasil-mcp-server/build/index.js"
    }
  }
}
```

#### Cursor

Adicione o seguinte ao seu arquivo `.cursor/mcp.json`:

```json
{
  "servers": {
    "viacep": {
      "command": "npx",
      "args": ["viacep-brasil-mcp-server"]
    }
  }
}
```

## Desenvolvimento

### Instalação de Dependências
```bash
npm install
```

### Construir o Servidor
```bash
npm run build
```

### Desenvolvimento com Auto-reconstrução
```bash
npm run watch
```

### Depuração

Como os servidores MCP se comunicam via stdio, a depuração pode ser desafiadora. Recomendamos usar o [MCP Inspector](https://github.com/modelcontextprotocol/inspector), que está disponível como um script de pacote:

```bash
npm run inspector
```

O Inspector fornecerá um URL para acessar ferramentas de depuração em seu navegador.

## Licença

Este projeto é licenciado sob os termos da licença MIT de código aberto.