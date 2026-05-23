
# Agil Facil

### Preparação do ambiente

```bash
 apt update
 apt install -y nodejs
 apt install npm -y
 apt install nginx -y
 npm install pm2@latest -g
 sudo apt install net-tools
```

### Clonar projeto do git

```bash
git clone https://github.com/mmgabri/agilfacil.git
```

### Configurando o Frontend - Reacj js

```bash
  cd agilfacil
  cd frontend
  npm install
  npm run build
  pm2 start --name agilfacil-frontend npm -- start
```


#### Configurando o Nginx

```bash
  cd /etc/nginx/sites-available
  sudo nano agilfacil
  sudo ln -s /etc/nginx/sites-available/agilfacil /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
```

#### Código Nginx para http: agilfacil

```bash
  server {
    listen 80;
    listen [::]:80;
    server_name agilfacil.com www.agilfacil.com agilfacil.com.br www.agilfacil.com.br;
    return 301 https://agilfacil.com.br$request_uri;

    location /socket/ {
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		 proxy_set_header Host $host;
		 proxy_pass http://localhost:9000;
		 proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```


### Configurando o Backend - Node js

```bash
  cd /home/ubuntu/agilfacil/backend
  npm install
  pm2 start --name agilfacil-backend npm -- start
  pm2 startup systemd
```

## Configurando para HTTPS

```bash
  sudo apt install certbot python3-certbot-nginx -y
  sudo certbot --nginx -d agilfacil.com.br -d www.agilfacil.com.br
  sudo certbot renew --dry-run
```
#### Atualize a configuração do nginx com o código abaixo
```bash
  server {
    server_name agilfacil.com.br;

    # Configuração para a aplicação principal
    location / {
        proxy_pass http://localhost:3000;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/agilfacil.com.br/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/agilfacil.com.br/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    listen 80;
    listen [::]:80;
    server_name agilfacil.com agilfacil.com.br www.agilfacil.com www.agilfacil.com.br;

    # Redireciona todas as solicitações para agilfacil.com com HTTPS
    return 301 https://agilfacil.com.br$request_uri;
}

server {
    listen 443 ssl;
    server_name agilfacil.com agilfacil.com.br www.agilfacil.com www.agilfacil.com.br;

    return 301 https://agilfacil.com.br$request_uri;
}

```
#### Executar comando para restartar o nginx
```bash
sudo systemctl restart nginx
```

## Observabilidade — CloudWatch Logs & Insights

O backend emite logs JSON estruturados em todos os handlers Lambda. No AWS, esses logs ficam disponíveis automaticamente nos log groups `/aws/lambda/<nome-da-função>`.

### Dois campos de nível: `@level` vs `level`

No CloudWatch Insights existem dois campos distintos:

| Campo | O que é | Quando usar |
|-------|---------|-------------|
| `@level` | Nível atribuído pelo Lambda runtime (`INFO`, `WARN`, `ERROR`) — determinado pelo método `console.*` usado | Captura **qualquer** output daquela severidade, incluindo warnings nativos do Node/SDK |
| `level` | Campo dentro do nosso JSON (`"info"`, `"warn"`, `"error"`) | Filtra **apenas** os logs estruturados da aplicação |

Nas queries abaixo usamos `level` (JSON) para isolar logs da aplicação e `@level` quando queremos capturar tudo incluindo erros do runtime.

### Correlation ID

Cada invocação Lambda gera automaticamente um `correlationId` (vindo do `requestContext.requestId` do API Gateway) que é incluído em **todos** os logs daquela execução. Use-o para rastrear o fluxo completo de uma requisição no CloudWatch Insights.

### Ativando o nível de log

A variável de ambiente `LOG_LEVEL` controla o que é gravado (padrão: `debug`):

| Valor | O que é logado |
|-------|----------------|
| `debug` (padrão) | Tudo: timing do DynamoDB, detalhes de payload, contagem de conexões no broadcast |
| `info` | Eventos de negócio: connect/disconnect, comandos, creates/deletes |
| `warn` | Apenas avisos e erros |
| `error` | Apenas erros |

Para alterar em uma função Lambda:
1. Acesse a função no console AWS → **Configuration → Environment variables**
2. Defina `LOG_LEVEL = info` (ou o nível desejado)

### Abrindo o CloudWatch Insights

1. Console AWS → **CloudWatch → Logs Insights**
2. Em **Select log group(s)**, escolha o grupo da função que quer investigar (ex: `/aws/lambda/agilfacil-board-ws`)
3. Ajuste o período (Time range) e cole a query desejada

### Queries úteis

#### Rastrear uma requisição pelo Correlation ID
```
fields @timestamp, level, message, boardId, roomId, userId, error, elapsedMs
| filter correlationId = "SEU_CORRELATION_ID_AQUI"
| sort @timestamp asc
```

#### Ver todos os erros recentes (app + runtime)
```
fields @timestamp, @level, level, message, boardId, roomId, userId, error
| filter @level = "ERROR"
| sort @timestamp desc
| limit 50
```

#### Ver apenas erros da aplicação (sem warnings do Node/SDK)
```
fields @timestamp, message, boardId, roomId, userId, error
| filter level = "error"
| sort @timestamp desc
| limit 50
```

#### Ver connects/disconnects por sessão (tshoot de usuário sumindo)
```
fields @timestamp, message, userId, idSession, connectionId
| filter level = "info" and (message like "connect" or message like "disconnect")
| sort @timestamp desc
| limit 100
```

#### Acompanhar um board específico (todos os comandos)
```
fields @timestamp, message, command, userId, error
| filter boardId = "SEU_BOARD_ID_AQUI"
| sort @timestamp desc
```

#### Acompanhar uma sala de poker específica
```
fields @timestamp, message, command, userId, vote, status
| filter roomId = "SEU_ROOM_ID_AQUI"
| sort @timestamp desc
```

#### Timing de operações DynamoDB (detectar lentidão)
```
fields @timestamp, message, table, elapsedMs
| filter message like "DynamoDB"
| sort elapsedMs desc
| limit 50
```

#### Comandos board mais lentos (debug ativado)
```
fields @timestamp, command, boardId, elapsedMs
| filter message = "Board command processed"
| sort elapsedMs desc
| limit 20
```

#### Contagem de erros da aplicação por tipo nas últimas 24h
```
fields message
| filter level = "error"
| stats count(*) as total by message
| sort total desc
```

#### Broadcasts com zero conexões (sessão fantasma)
```
fields @timestamp, idSession, type, connectionCount
| filter message = "Broadcast to session" and connectionCount = 0
| sort @timestamp desc
```

---

## Configuração do Lambda Health Check

#### No ambiente local, na pasta health-check, executar os seguintes comandos, e verificar se os recusrsos foram criados no ambiente aws:

```bash
pip install -r requirements.txt -t ./FunctionHealth
sam build
sam deploy --guided
```

#### Observações Importantes

1. **Liberar Portas no Security Group:**
   - Certifique-se de liberar as portas **9000** e **3000** no grupo de segurança (security group) para permitir o tráfego necessário para a aplicação.

2. **Ajuste do Arquivo `.env` no Backend:**
   - Antes de subir a aplicação, configure o arquivo `.env` do backend conforme o ambiente (dev ou prod) em que a aplicação será executada. 

3. **Para testar local, precisa configurar o cognito da seguinte forma:**
    - No arquivo aws-exports, ajustar a url dos campos redirectSignIn e redirectSignOut
    - No Cognito, ajustar a url em Allowed callback URLs e Allowed sign-out URLs - optional

4. **Ajuste o arquivo frontend\src\constants\apiConstants.js de acordo com o ambiente que for subir a aplicação**

5. **Ajuste de IP no CloudFlare (Ambiente AWS):**
   - Quando for subir uma nova instância no ambiente AWS, é necessário ajustar o endereço IP no CloudFlare. Acesse o painel da CloudFlare através do link abaixo e atualize o IP para o novo endereço da instância:
     - [Painel CloudFlare](https://dash.cloudflare.com/)