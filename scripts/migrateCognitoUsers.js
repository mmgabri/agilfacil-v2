/**
 * Migração de usuários do Cognito antigo → Cognito novo
 *
 * O que faz:
 *   - Usuários email/senha (isGoogle: false):
 *       adminCreateUser com MessageAction=SUPPRESS + custom:legacy_id=userId antigo
 *       Status resultante: FORCE_CHANGE_PASSWORD
 *       → No próximo login o usuário cria sua nova senha (sem email enviado)
 *
 *   - Usuários Google (isGoogle: true):
 *       Se já existem no novo pool (já logaram pelo Google) → apenas atualiza custom:legacy_id
 *       Se ainda não existem → imprime aviso (eles serão mapeados no primeiro login)
 *
 * Pré-requisitos:
 *   cd backend && npm install    (para ter @aws-sdk/client-cognito-identity-provider)
 *   AWS_PROFILE ou variáveis de ambiente com acesso ao novo pool
 *
 * Uso:
 *   node scripts/migrateCognitoUsers.js [--dry-run] [--pool-id=<id>] [--secret=<secret>]
 *
 * Flags:
 *   --dry-run           Mostra o que seria feito sem chamar a AWS
 *   --region=<region>   Região AWS (default: sa-east-1)
 *   --pool-id=<id>      ID do novo User Pool (obrigatório se não definido em NEW_USER_POOL_ID)
 *   --secret=<secret>   MIGRATION_SECRET do .env / Terraform (obrigatório)
 */

'use strict';

// Resolve os módulos AWS SDK instalados em backend/node_modules
const path = require('path');
process.env.NODE_PATH = path.join(__dirname, '../backend/node_modules');
require('module').Module._initPaths();

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');

// ─── Argumentos ──────────────────────────────────────────────────────────────

const ARGS       = process.argv.slice(2);
const DRY_RUN    = ARGS.includes('--dry-run');
const REGION     = ARGS.find(a => a.startsWith('--region='))?.split('=')[1]  ?? process.env.REGION     ?? 'sa-east-1';
const POOL_ID    = ARGS.find(a => a.startsWith('--pool-id='))?.split('=')[1] ?? process.env.NEW_USER_POOL_ID;
const SECRET     = ARGS.find(a => a.startsWith('--secret='))?.split('=')[1]  ?? process.env.MIGRATION_SECRET;

if (!POOL_ID) { console.error('❌  Informe --pool-id=<id> ou defina NEW_USER_POOL_ID'); process.exit(1); }
if (!SECRET)  { console.error('❌  Informe --secret=<secret> ou defina MIGRATION_SECRET'); process.exit(1); }

// ─── Senha temporária determinística (mesma lógica do controllerAuthService) ─

const getTempPassword = (email) =>
  crypto.createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex').slice(0, 16) + 'Aa1!';

// ─── Lista de usuários exportados do Cognito antigo ──────────────────────────
// userId = sub do Cognito antigo (valor usado como creatorId em boards/rooms)

const USERS = [
  { email: 'laura.mello@itau-unibanco.com.br',              userId: 'c1437d1a-0081-70f8-3dd2-8c130ee78e5b', userName: 'Laura Mello',           isGoogle: false },
  { email: 'katia.a.albuquerque-lima@itau-unibanco.com.br', userId: '61639daa-7031-709e-2fb6-f7ba80613ff3', userName: 'katia albuquerque lima',  isGoogle: false },
  { email: 'guilhermersimoes87@gmail.com',                  userId: '01235d0a-c0c1-70da-a470-f0b167da6bca', userName: 'Guilherme Romão',          isGoogle: true  },
  { email: 'thiago.leite-frauches@itau-unibanco.com.br',    userId: 'c1e3adda-2021-7017-9cb9-05bc7d2d2f89', userName: 'Thiago',                   isGoogle: false },
  { email: 'isa.gabri00@gmail.com',                         userId: '31b3cd1a-9051-70b7-3583-2db4ba0d7146', userName: 'Isabela Gabriel',          isGoogle: true  },
  { email: 'mayra.moreira@itau-unibanco.com.br',            userId: '31336d8a-d061-706b-ed40-06452471443a', userName: 'Mayra Lopes Moreira',      isGoogle: false },
  { email: 'mariana.chan@itau-unibanco.com.br',              userId: '9123cd8a-5091-70c0-43ca-496c5a2f13b6', userName: 'Mariana Chan',             isGoogle: false },
  { email: 'marcel26.palma@gmail.com',                      userId: 'c1a38d0a-40b1-7041-e528-3a787e8f355c', userName: 'Marcello Palma',           isGoogle: false },
  { email: 'plantaodebito2@gmail.com',                      userId: 'f1338d3a-20e1-709f-479b-509c9d27690e', userName: 'Plantao Debito 2',         isGoogle: true  },
  { email: 'juliocezar84@gmail.com',                        userId: 'a1535d2a-c0a1-7028-842f-a5a23fd5cecc', userName: 'Julio Vicente',            isGoogle: false },
  { email: 'nicolas.castellani-silva@itau-unibanco.com.br', userId: '61e37d7a-30c1-7098-eb35-5bcf8207d076', userName: 'Nicolas Castellani',       isGoogle: false },
  { email: 'alessandra.spioni-estevao@itau-unibanco.com.br',userId: '5163dd9a-30a1-7079-3653-652c63acc629', userName: 'Alessandra',               isGoogle: false },
  { email: 'marcelomgabriel@gmail.com',                     userId: 'd1b32dda-50f1-7083-4aac-5c69a42ecce1', userName: 'Marcelo Gabriel',          isGoogle: true  },
];

// ─── Cliente Cognito ──────────────────────────────────────────────────────────

const client = new CognitoIdentityProviderClient({ region: REGION });

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function userExistsInNewPool(email) {
  try {
    await client.send(new AdminGetUserCommand({ UserPoolId: POOL_ID, Username: email }));
    return true;
  } catch (err) {
    if (err.name === 'UserNotFoundException') return false;
    throw err;
  }
}

async function createEmailUser({ email, userId, userName }) {
  await client.send(new AdminCreateUserCommand({
    UserPoolId:      POOL_ID,
    Username:        email,
    MessageAction:   'SUPPRESS',        // sem email
    TemporaryPassword: getTempPassword(email),
    UserAttributes: [
      { Name: 'email',              Value: email    },
      { Name: 'email_verified',     Value: 'true'   },
      { Name: 'name',               Value: userName },
      { Name: 'custom:legacy_id',   Value: userId   },
    ],
  }));
}

async function setLegacyIdForGoogleUser({ email, userId }) {
  await client.send(new AdminUpdateUserAttributesCommand({
    UserPoolId: POOL_ID,
    Username:   email,
    UserAttributes: [
      { Name: 'custom:legacy_id', Value: userId },
    ],
  }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  const W = 65;
  console.log('\n' + '═'.repeat(W));
  console.log(` Migração Cognito  →  pool: ${POOL_ID}`);
  console.log(` Região: ${REGION}   Usuários: ${USERS.length}`);
  if (DRY_RUN) console.log(' Modo: DRY-RUN (nenhuma chamada à AWS será feita)');
  console.log('═'.repeat(W) + '\n');

  let ok = 0, skip = 0, fail = 0;

  for (const user of USERS) {
    const tag  = user.isGoogle ? '[Google]     ' : '[email/senha]';
    const line = `  ${tag} ${user.email}`;

    if (DRY_RUN) {
      const action = user.isGoogle ? 'update custom:legacy_id (se já existir no pool)' : 'adminCreateUser + FORCE_CHANGE_PASSWORD';
      console.log(`📋 ${line}`);
      console.log(`      → ${action}  legacy_id=${user.userId}`);
      ok++;
      continue;
    }

    try {
      if (user.isGoogle) {
        // Usuários Google só podem ser mapeados após o primeiro login via Google
        const exists = await userExistsInNewPool(user.email);
        if (exists) {
          await setLegacyIdForGoogleUser(user);
          console.log(`✅ ${line}  (custom:legacy_id atualizado)`);
          ok++;
        } else {
          console.log(`⏭️  ${line}  (ainda não logou no novo pool — será mapeado no primeiro login)`);
          skip++;
        }
      } else {
        await createEmailUser(user);
        console.log(`✅ ${line}  (criado com FORCE_CHANGE_PASSWORD)`);
        ok++;
      }
    } catch (err) {
      if (err.name === 'UsernameExistsException') {
        console.log(`⚠️  ${line}  (já existe no pool — ignorado)`);
        skip++;
      } else {
        console.error(`❌ ${line}`);
        console.error(`   → ${err.message}`);
        fail++;
      }
    }
  }

  console.log('\n' + '─'.repeat(W));
  console.log(` OK: ${ok}   Ignorados: ${skip}   Erros: ${fail}`);
  if (skip > 0) {
    console.log('\n ℹ️  Usuários Google "ignorados" precisam logar uma vez pelo Google');
    console.log('    para ter a conta criada no novo pool. Depois re-execute este script');
    console.log('    para definir o custom:legacy_id deles.');
  }
  console.log('─'.repeat(W) + '\n');

  if (fail > 0) process.exit(1);
}

migrate().catch((err) => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
