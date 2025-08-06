# Microsserviço Mapoteca

## Descrição

Microsserviço responsável pela orquestração central do sistema de preservação digital. Atua como único ponto de entrada para todas as operações do Front-End, coordenando o fluxo completo de preservação desde o upload até o acesso aos arquivos.

Recebe requisições de upload, download, criação de pastas e outras operações, delegando o processamento para os microsserviços especializados (Gestão de Dados e Storage) e mantendo o controle de status de cada operação em seu banco de dados próprio.

## Características

- Orquestração de microsserviços
- Controle de status de operações
- Cache Redis
- Integração com Storage e Gestão de Dados

## Tecnologias

- Node.js/NestJS
- TypeScript
- PostgreSQL
- Redis
- Docker

## Arquitetura

```mermaid
graph TB
    FE[Front-End] --> MAP[Mapoteca :3000]
    MAP --> GD[Gestão Dados :8000]
    MAP --> ST[Storage :3003]
    MAP --> MDB[(Mapoteca DB :5433)]
    MAP --> REDIS[(Redis)]
    
    GD --> PDB[(Preservação DB :5434)]
    ST --> MINIO[(MinIO :9000)]
```

## Fluxos

### Upload
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão   💾 Storage  📦 MinIO
     │           │        Dados         │          │
     │──────────▶│          │           │          │
     │ 📤 upload │          │           │          │
     │           │─────────▶│           │          │
     │           │ 🔄 process│           │          │
     │           │          │──────────▶│          │
     │           │          │ ⬆️ upload │          │
     │           │          │           │─────────▶│
     │           │          │           │ 💾 store │
     │           │◀─────────│           │          │
     │           │ ✅ done  │           │          │
     │◀──────────│          │           │          │
     │ ✅ status │          │           │          │
```

```mermaid
sequenceDiagram
    FE->>MAP: Upload + metadados
    MAP->>GD: Processa arquivos
    GD->>ST: Upload processados
    ST->>MINIO: Armazena
    GD-->>MAP: Callback concluído
    MAP-->>FE: Status final
```

### Download
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão   💾 Storage  📦 MinIO
     │           │        Dados         │          │
     │──────────▶│          │           │          │
     │ 📥 request│          │           │          │
     │           │─────────▶│           │          │
     │           │ 🔍 locate│           │          │
     │           │◀─────────│           │          │
     │           │ 📍 path  │           │          │
     │           │──────────────────────▶│          │
     │           │        📄 get        │          │
     │           │          │           │─────────▶│
     │           │          │           │ 📦 fetch │
     │           │          │           │◀─────────│
     │           │          │           │ 📄 file  │
     │           │◀──────────────────────│          │
     │           │        📄 return     │          │
     │◀──────────│          │           │          │
     │ 📄 arquivo│          │           │          │
```

```mermaid
sequenceDiagram
    FE->>MAP: Solicita download
    MAP->>GD: Busca localização
    MAP->>ST: Solicita arquivo
    ST->>MINIO: Busca arquivo
    ST-->>MAP: Retorna arquivo
    MAP-->>FE: Entrega arquivo
```

### Delete
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão   💾 Storage  📦 MinIO
     │           │        Dados         │          │
     │──────────▶│          │           │          │
     │ 🗑️ delete │          │           │          │
     │           │─────────▶│           │          │
     │           │ ❌ mark  │           │          │
     │           │◀─────────│           │          │
     │           │ 📋 list  │           │          │
     │           │──────────────────────▶│          │
     │           │        🗑️ delete     │          │
     │           │          │           │─────────▶│
     │           │          │           │ ❌ remove│
     │           │          │           │◀─────────│
     │           │          │           │ ✅ done  │
     │           │◀──────────────────────│          │
     │           │        ✅ confirm    │          │
     │◀──────────│          │           │          │
     │ ✅ deleted│          │           │          │
```

### Criar Pasta
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão
     │           │        Dados
     │──────────▶│          │
     │ 📁 create │          │
     │           │─────────▶│
     │           │ 🆕 new   │
     │           │◀─────────│
     │           │ ✅ created
     │◀──────────│          │
     │ ✅ pasta  │          │
```

### Listar Pastas
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão
     │           │        Dados
     │──────────▶│          │
     │ 📋 list   │          │
     │           │─────────▶│
     │           │ 🔍 query │
     │           │◀─────────│
     │           │ 📋 folders
     │◀──────────│          │
     │ 📋 lista  │          │
```

### Renomear Pasta
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão   💾 Storage  📦 MinIO
     │           │        Dados         │          │
     │──────────▶│          │           │          │
     │ ✏️ rename │          │           │          │
     │           │─────────▶│           │          │
     │           │ 🔄 update│           │          │
     │           │◀─────────│           │          │
     │           │ 📋 moves │           │          │
     │           │──────────────────────▶│          │
     │           │        🔄 move       │          │
     │           │          │           │─────────▶│
     │           │          │           │ 📁 rename│
     │           │          │           │◀─────────│
     │           │          │           │ ✅ moved │
     │           │◀──────────────────────│          │
     │           │        ✅ confirm    │          │
     │◀──────────│          │           │          │
     │ ✅ renamed│          │           │          │
```

### Deletar Pasta
```
🌐 Front-End  🎯 Mapoteca  📊 Gestão   💾 Storage  📦 MinIO
     │           │        Dados         │          │
     │──────────▶│          │           │          │
     │ 🗑️ delete │          │           │          │
     │           │─────────▶│           │          │
     │           │ ❌ cascade│           │          │
     │           │◀─────────│           │          │
     │           │ 📋 files │           │          │
     │           │──────────────────────▶│          │
     │           │        🗑️ delete     │          │
     │           │          │           │─────────▶│
     │           │          │           │ ❌ remove│
     │           │          │           │◀─────────│
     │           │          │           │ ✅ done  │
     │           │◀──────────────────────│          │
     │           │        ✅ confirm    │          │
     │◀──────────│          │           │          │
     │ ✅ deleted│          │           │          │
```

## API Endpoints

### Pedidos (Arquivos)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/pedidos/upload` | Upload de arquivos |
| GET | `/pedidos/{id}/download` | Download de arquivo |
| GET | `/pedidos/{id}` | Detalhes do item |
| GET | `/pedidos` | Lista todos os itens |
| PUT | `/pedidos/{id}/rename` | Renomeia item |
| DELETE | `/pedidos/{id}` | Remove item |

### Pastas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/pastas` | Cria nova pasta |
| GET | `/pastas` | Lista todas as pastas |
| GET | `/pastas/{id}` | Conteúdo da pasta |
| PUT | `/pastas/{id}` | Renomeia pasta |
| DELETE | `/pastas/{id}` | Remove pasta |

## Modelo de Dados

```mermaid
erDiagram
    OPERATION {
        string id PK
        string type
        string status
        datetime created_at
        json metadata
    }
    
    FILE_REFERENCE {
        string id PK
        string operation_id FK
        string original_name
        string preserved_path
        string checksum
    }
    
    OPERATION ||--o{ FILE_REFERENCE : contains
```

## Configuração

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://user:password@mapoteca_db_container:5432/mapoteca_db
STORAGE_SERVICE_URL=http://storage_app:3003
GESTAO_DADOS_API_URL=http://gestao_dados_app:8000
REDIS_HOST=redis_cache
REDIS_PORT=6379
```

### Docker
```bash
docker-compose up -d mapoteca_app
```

## Execução

### Desenvolvimento
```bash
npm install
npx prisma migrate dev
npm run start:dev
```

### Produção
```bash
docker-compose up -d
```

## Fluxo de Processamento

```
    🚀 INÍCIO
       │
       ▼
┌─────────────────┐
│ 📨 Recebe HTTP  │
└─────────┬───────┘
          │
          ▼
     ❓ Válido?
      ╱       ╲
   Sim╱         ╲Não
     ╱           ╲
    ▼             ▼
┌─────────────┐ ┌─────────────┐
│ 💾 Registra │ │ ❌ Erro     │
│  operação   │ │   HTTP      │
└─────┬───────┘ └─────────────┘
      │
      ▼
┌─────────────┐
│ 🔄 Delega   │
│microsserviço│
└─────┬───────┘
      │
      ▼
  📊 Processa?
    ╱       ╲
 OK╱         ╲Erro
  ╱           ╲
 ▼             ▼
┌─────────────┐ ┌─────────────┐
│ ✅ Atualiza │ │ ❌ Atualiza │
│  completed  │ │   failed    │
└─────┬───────┘ └─────┬───────┘
      │               │
      └───────┬───────┘
              ▼
        ┌─────────────┐
        │ 📢 Notifica │
        │  Front-End  │
        └─────────────┘
```

## Monitoramento

- Health check: `GET /health`
- Logs estruturados
- Métricas via Redis
- Interface MinIO: http://localhost:9001