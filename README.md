# AgilFácil

Ferramenta colaborativa para times ágeis, com dois recursos em tempo real:

- **Boards** (retrospectivas / Kanban): colunas, cards, likes, junção de cards, timer e ofuscação.
- **Planning Poker**: salas de votação.

Produção: **https://agilfacil.com.br**

---

## Arquitetura

```
                        ┌───────────────────────────┐
Navegador ── HTTPS ───> │ Cloudflare                │
   │                    │ frontend estático (React) │
   │                    └───────────────────────────┘
   │
   │                    ┌───────────────────────┐     ┌────────────────┐
   │                    │ API Gateway HTTP      │     │ Lambda         │
   ├── HTTPS (REST) ──> │ agilfacil-http        │ ──> │ agilfacil-rest │ ─────────┐
   │                    │ JWT Cognito nas rotas │     │ agilfacil-auth │          │
   │                    │ protegidas            │     └────────────────┘          │
   │                    └───────────────────────┘                                 │
   │                                                                              v
   │                    ┌───────────────────────┐     ┌────────────────┐    ┌──────────┐
   │                    │ API Gateway WebSocket │     │ Lambda         │    │          │
   └── WSS (WebSocket)> │ agilfacil-board-ws    │ ──> │ agilfacil-ws   │ ──>│ DynamoDB │
                        │ agilfacil-poker-ws    │ <── │ (broadcast)    │    │          │
                        └───────────────────────┘     └────────────────┘    └──────────┘

Autenticação: Amazon Cognito (e-mail/senha e Google) + Lambda agilfacil-cognito-pre-signup
Alertas/Suporte: SNS
```

Toda a infraestrutura AWS fica em `sa-east-1` e é provisionada com **Terraform** (`terraform/`).

| Recurso | Nome |
|---|---|
| Lambdas | `agilfacil-rest`, `agilfacil-auth`, `agilfacil-ws`, `agilfacil-cognito-pre-signup` (mesmo pacote de código: `backend/`) |
| API HTTP | `agilfacil-http` → rotas em `terraform/api_gateway_http.tf` |
| APIs WebSocket | `agilfacil-board-ws` (rota `comand_socket_board`), `agilfacil-poker-ws` (rota `comand_socket_poker`) |
| DynamoDB | `agilfacil_board` (GSI `gsi_board_user`), `agilfacil_room` (GSI `gsi_room_user`), `agilfacil_connections` (GSI `idSessionIndex`, TTL 24h) |

> A tabela `agilfacil_board` já existia e **não** é gerenciada pelo Terraform (é referenciada por nome/ARN).

### Fluxo em tempo real

1. O frontend abre o WebSocket com `?userName&userId&idSession&service=board|poker` (`frontend/src/customHooks/useSocket.js`).
2. `$connect` grava a conexão em `agilfacil_connections` e registra o usuário no board/sala.
3. Cada ação do usuário é um comando (`{ action, comand, boardId|roomId, ... }`). A Lambda altera o item no DynamoDB e faz **broadcast** do estado completo para todas as conexões da sessão.
4. `$disconnect` remove a conexão e tira o usuário da lista de online.

### Decisões importantes (não quebre sem saber)

- **Gravação com controle de versão.** Board e sala são gravados como um item inteiro. Toda alteração passa por `mutateItem` (`backend/services/database/dynamoService.js`): lê, aplica a mudança e grava com `ConditionExpression` no atributo `version`. Se houver conflito, relê e tenta de novo, com backoff. Sem isso, usuários simultâneos sobrescrevem as alterações uns dos outros: num teste de carga, 6 usuários criando cards ao mesmo tempo perderam 73% deles. **Nunca grave board/sala com `putTable` direto.**
- **Cards identificados por id.** Os comandos de card enviam `cardId`/`columnId`, e o backend localiza o card pelo id, porque o índice pode estar desatualizado. `add_card_board` é idempotente.
- **Conexão resiliente no frontend.** O `useSocket`:
  - reconecta automaticamente com backoff;
  - guarda numa fila os comandos feitos enquanto desconectado e os reenvia ao reconectar;
  - envia `ping` a cada 5 min, porque o API Gateway derruba conexões sem tráfego após **10 min**;
  - o board mostra um aviso enquanto está reconectando.
- **O broadcast não apaga conexões com 410 (Gone).** Quem remove a conexão é o `$disconnect`, que precisa do registro para saber qual usuário sair da lista de online.

---

## Estrutura do repositório

```
backend/
  handlers/
    rest/      # restIndex.js roteia as rotas HTTP para cada handler
    ws/        # wsIndex.js → boardIndex.js / pokerIndex.js
    auth/      # status de autenticação / definição de senha (migração de usuários)
    cognito/   # trigger pre-signup
  services/
    board/     # regras do board (socketBoardService.js)
    poker/     # regras do poker (socketPokerService.js)
    connections/  # tabela de conexões WebSocket
    database/  # acesso ao DynamoDB (inclui mutateItem)
    generic/   # SNS, CloudWatch, etc.
  utils/       # logger estruturado, broadcast, auth
  config.js    # nomes de tabelas/índices
  template.yaml + events/   # SAM — usado só para testes locais das Lambdas
frontend/
  src/
    main/App.js          # rotas e <ProtectedRoute>
    pages/board|poker|generic/
    customHooks/useSocket.js
    constants/apiConstants.js
  scripts/write-build-info.js   # gera version.json (ver "Versão publicada")
terraform/     # infraestrutura AWS
scripts/       # utilitários pontuais (ex.: migração de usuários do Cognito)
```

---

## Desenvolvimento local

### Pré-requisitos

- Node.js 22 (mesmo runtime das Lambdas)
- AWS CLI configurado para a conta do projeto (`aws sts get-caller-identity`)
- Terraform >= 1.5 (só para deploy do backend)
- AWS SAM CLI (opcional, para invocar Lambdas localmente)

### Frontend

```bash
cd frontend
npm install
npm start          # http://localhost:3000
```

> ⚠️ **Por padrão, o frontend local usa as APIs de PRODUÇÃO** (REST e WebSocket), por causa dos valores padrão em `src/constants/apiConstants.js`. Boards e salas criados localmente são reais. Para apontar para outra infraestrutura, crie `frontend/.env.development.local` (veja [Configuração](#configuração)).

**Login local com Cognito:** ajuste `redirectSignIn`/`redirectSignOut` em `frontend/src/aws-exports.js` para `http://localhost:3000/` e confirme que essa URL está em *Allowed callback URLs* / *Allowed sign-out URLs* do app client no Cognito.

### Backend (Lambdas)

Não existe servidor local: o backend roda só como Lambda. Para testar um handler localmente com o SAM:

```bash
cd backend
npm install
sam build
sam local invoke BoardWsFunction --event events/ws-connect.json
sam local invoke BoardWsFunction --event events/ws-board-command.json
```

> As Lambdas invocadas localmente usam suas credenciais AWS e acessam as tabelas reais do DynamoDB.

---

## Configuração

### Frontend (`frontend/.env.*`, não versionados)

O CRA carrega `.env.development` no `npm start` e `.env.production` no `npm run build`. Overrides só da sua máquina vão em `.env.*.local`.

| Variável | Padrão (se ausente) |
|---|---|
| `REACT_APP_FRONT_BASE_URL` | `https://agilfacil.com.br` (build) / `http://localhost:3000` (dev) |
| `REACT_APP_SERVER_BASE_URL` | URL do API Gateway HTTP de produção |
| `REACT_APP_WS_BOARD_URL` | WebSocket de board de produção |
| `REACT_APP_WS_POKER_URL` | WebSocket de poker de produção |
| `REACT_APP_LOG_LEVEL` | nível de log no console do navegador (`debug`, `info`, `warn`, `error`) |

As URLs atuais saem do Terraform: `terraform output http_api_url ws_board_url ws_poker_url`.

### Backend (variáveis de ambiente das Lambdas, definidas em `terraform/lambda.tf`)

`REGION`, `TABLE_BOARD`, `TABLE_ROOM`, `TABLE_CONNECTIONS`, `TOPIC_ARN`, `TOPIC_ARN_SUPPORT`, `USER_POOL_ID`, `CLIENT_ID`, `MIGRATION_SECRET` e, opcionalmente, `LOG_LEVEL` (padrão `debug`).

---

## Deploy

### Backend (Lambdas) — Terraform

O Terraform gera um ZIP do diretório `backend/`, incluindo `node_modules`, e atualiza as quatro Lambdas. O state é **local** (`terraform/terraform.tfstate`, não versionado).

```bash
cd backend && npm install && cd ..
cd terraform
terraform plan      # SEMPRE revise: deve mudar só source_code_hash das Lambdas
terraform apply
```

Se o `plan` trouxer mudanças fora das Lambdas que você não pretende aplicar, limite o apply:

```bash
terraform apply \
  -target=aws_lambda_function.ws -target=aws_lambda_function.rest \
  -target=aws_lambda_function.auth -target=aws_lambda_function.cognito_pre_signup
```

Validação rápida:

```bash
curl https://v2ffd9vlb9.execute-api.sa-east-1.amazonaws.com/healthcheck
aws lambda get-function-configuration --region sa-east-1 --function-name agilfacil-ws \
  --query "[LastModified,LastUpdateStatus]"
```

### Frontend — Cloudflare

1. **Faça commit antes do build.** A versão publicada é derivada do commit, e um build com alterações pendentes sai marcado como `dirty`.
2. Gere o build:
   ```bash
   cd frontend
   npm run build      # roda scripts/write-build-info.js antes (prebuild)
   ```
3. Publique o conteúdo de `frontend/build/` na Cloudflare.
4. Confira a versão publicada (próxima seção).

### Versão publicada

A cada `npm start`/`npm run build`, o script `frontend/scripts/write-build-info.js` gera as informações de versão:

- **Formato:** `<version do package.json>+<nº de commits>`, por exemplo `0.1.0+29`. O número sobe sozinho a cada commit.
- **Outros campos:** hash e data do commit, branch, horário do build e a flag `dirty`.

| Onde | O que mostra |
|---|---|
| `curl -s https://agilfacil.com.br/version.json` | o que está **publicado** |
| https://agilfacil.com.br/version | o que **o seu navegador** está rodando, comparado com o publicado. Se não bater, é cache: Ctrl+Shift+R |

---

## Operação e troubleshooting

| Sintoma | Causa provável / o que verificar |
|---|---|
| Cards "não aparecem para os outros" | Conexão WebSocket caiu. Veja os logs de `$disconnect` (consulta abaixo); o frontend deve exibir o aviso de reconexão. |
| Console: `WebSocket desconectado code=1001 reason=Going away` | O API Gateway encerrou a conexão: ociosidade (10 min sem tráfego) ou duração máxima (2 h). O frontend reconecta sozinho. |
| Usuários "fantasmas" no contador de online | `$disconnect` não removeu o usuário. Verifique erros em `Erro no $disconnect`. |
| Comandos perdidos sob carga | Limite de concorrência da Lambda na conta (`aws lambda get-account-settings --region sa-east-1`) e métrica `Throttles` de `agilfacil-ws`. O padrão AWS é 1000; contas novas começam com 10. |
| Muitos `DynamoDB conflito de escrita` nos logs | É esperado sob uso simultâneo (é o retry funcionando). Só preocupa se aparecer `tentativas esgotadas`. |
| Login falha localmente | URLs de callback do Cognito (ver [Frontend](#frontend)). |

---

## Observabilidade — CloudWatch Logs & Insights

O backend emite logs JSON estruturados (`backend/utils/logger.js`) nos log groups `/aws/lambda/<função>`:

| Log group | Conteúdo |
|---|---|
| `/aws/lambda/agilfacil-ws` | WebSocket de board e poker (connect, disconnect, comandos, broadcast) |
| `/aws/lambda/agilfacil-rest` | API REST |
| `/aws/lambda/agilfacil-auth` | Autenticação/migração |
| `/aws/lambda/agilfacil-cognito-pre-signup` | Trigger do Cognito |

### Dois campos de nível: `@level` vs `level`

| Campo | O que é | Quando usar |
|-------|---------|-------------|
| `@level` | Nível atribuído pelo runtime da Lambda (`INFO`, `WARN`, `ERROR`), conforme o `console.*` usado | Captura **qualquer** saída daquela severidade, inclusive warnings do Node/SDK |
| `level` | Campo dentro do nosso JSON (`"info"`, `"warn"`, `"error"`) | Filtra **apenas** os logs estruturados da aplicação |

### Correlation ID

Cada invocação recebe um `correlationId` (o `requestContext.requestId` do API Gateway), incluído em **todos** os logs daquela execução. Use-o para rastrear uma requisição de ponta a ponta.

### Nível de log

A variável de ambiente `LOG_LEVEL` controla o que é gravado (padrão: `debug`):

| Valor | O que é logado |
|-------|----------------|
| `debug` (padrão) | Tudo: payloads recebidos, tempo do DynamoDB, broadcast |
| `info` | Eventos de negócio: connect/disconnect (com motivo), comandos, conflitos de escrita |
| `warn` | Apenas avisos e erros |
| `error` | Apenas erros |

Para alterar, defina `LOG_LEVEL` no bloco `environment` da Lambda em `terraform/lambda.tf` e faça o deploy. Alterações feitas pelo console da AWS são sobrescritas no próximo `terraform apply`.

### Como abrir

Console AWS → **CloudWatch → Logs Insights** → selecione o log group (ex.: `/aws/lambda/agilfacil-ws`) → ajuste o período → cole a consulta.

### Consultas úteis

#### Rastrear uma requisição pelo Correlation ID
```
fields @timestamp, level, message, boardId, roomId, userId, error, elapsedMs
| filter correlationId = "SEU_CORRELATION_ID_AQUI"
| sort @timestamp asc
```

#### Erros recentes (app + runtime)
```
fields @timestamp, @level, level, message, boardId, roomId, userId, error
| filter @level = "ERROR"
| sort @timestamp desc
| limit 50
```

#### Motivo das desconexões WebSocket
```
fields @timestamp, connectionId, disconnectStatusCode, disconnectReason
| filter message = "wsIndex: disconnect"
| stats count(*) as total by disconnectStatusCode, disconnectReason
| sort total desc
```

#### Connects/disconnects de um board (usuário "sumindo")
```
fields @timestamp, message, userId, connectionId
| filter idSession = "SEU_BOARD_ID_AQUI" and (message like /connect/)
| sort @timestamp asc
```

#### Todos os comandos de um board
```
fields @timestamp, message, command, error
| filter boardId = "SEU_BOARD_ID_AQUI"
| sort @timestamp desc
```

#### Conteúdo enviado pelos usuários (com `LOG_LEVEL=debug`)
```
fields @timestamp, connectionId, body.comand, body.newCard.content, body.content
| filter message = "wsIndex: request" and body.boardId = "SEU_BOARD_ID_AQUI"
| sort @timestamp asc
```

#### Clientes enviando heartbeat (frontend atualizado)
```
fields @timestamp, connectionId
| filter message = "wsIndex: request" and body.comand = "ping"
| stats count(*) by bin(10m)
```

#### Conflitos de escrita e retries esgotados
```
fields @timestamp, message, table, id, attempt
| filter message like /conflito de escrita/
| stats count(*) as total by message
```

#### Uma sala de poker
```
fields @timestamp, message, command, userId, vote, status
| filter roomId = "SEU_ROOM_ID_AQUI"
| sort @timestamp desc
```

#### Tempo das operações no DynamoDB
```
fields @timestamp, message, table, elapsedMs
| filter message like "DynamoDB"
| sort elapsedMs desc
| limit 50
```

#### Comandos de board mais lentos
```
fields @timestamp, command, boardId, elapsedMs
| filter message = "Board command processed"
| sort elapsedMs desc
| limit 20
```

#### Erros da aplicação por tipo
```
fields message
| filter level = "error"
| stats count(*) as total by message
| sort total desc
```
