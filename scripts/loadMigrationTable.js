/**
 * Carrega a tabela agilfacil_users com os usuários
 * exportados do Cognito da conta antiga.
 *
 * Pré-requisito:
 *   cd scripts && npm install   (ou usar node_modules do backend)
 *
 * Uso:
 *   node scripts/loadMigrationTable.js [--dry-run]
 *
 * Flags:
 *   --dry-run   Exibe o que seria inserido sem gravar no DynamoDB
 *   --region    Região AWS (default: sa-east-1)
 *   --table     Nome da tabela (default: agilfacil_users)
 */

'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// ─── Configuração ─────────────────────────────────────────────────────────────

const ARGS      = process.argv.slice(2);
const DRY_RUN   = ARGS.includes('--dry-run');
const REGION    = ARGS.find(a => a.startsWith('--region='))?.split('=')[1] ?? 'sa-east-1';
const TABLE     = ARGS.find(a => a.startsWith('--table='))?.split('=')[1]  ?? 'agilfacil_users';

// ─── Dados dos usuários exportados do Cognito antigo ─────────────────────────
// Fonte: 09-users.json
// userId = sub do Cognito antigo (valor usado como creatorId em boards/rooms)

const COGNITO_USERS = [
  {
    email:    'laura.mello@itau-unibanco.com.br',
    userId:   'c1437d1a-0081-70f8-3dd2-8c130ee78e5b',
    userName: 'Laura Mello',
    isGoogle: false,
  },
  {
    email:    'katia.a.albuquerque-lima@itau-unibanco.com.br',
    userId:   '61639daa-7031-709e-2fb6-f7ba80613ff3',
    userName: 'katia albuquerque lima',
    isGoogle: false,
  },
  {
    email:    'guilhermersimoes87@gmail.com',
    userId:   '01235d0a-c0c1-70da-a470-f0b167da6bca',
    userName: 'Guilherme Romão',
    isGoogle: true,
  },
  {
    email:    'thiago.leite-frauches@itau-unibanco.com.br',
    userId:   'c1e3adda-2021-7017-9cb9-05bc7d2d2f89',
    userName: 'Thiago',
    isGoogle: false,
  },
  {
    email:    'isa.gabri00@gmail.com',
    userId:   '31b3cd1a-9051-70b7-3583-2db4ba0d7146',
    userName: 'Isabela Gabriel',
    isGoogle: true,
  },
  // builderam@email.com → UNCONFIRMED — conta nunca ativada, ignorada intencionalmente
  {
    email:    'mayra.moreira@itau-unibanco.com.br',
    userId:   '31336d8a-d061-706b-ed40-06452471443a',
    userName: 'Mayra Lopes Moreira',
    isGoogle: false,
  },
  {
    email:    'mariana.chan@itau-unibanco.com.br',
    userId:   '9123cd8a-5091-70c0-43ca-496c5a2f13b6',
    userName: 'Mariana Chan',
    isGoogle: false,
  },
  {
    email:    'marcel26.palma@gmail.com',
    userId:   'c1a38d0a-40b1-7041-e528-3a787e8f355c',
    userName: 'Marcello Palma',
    isGoogle: false,
  },
  {
    email:    'plantaodebito2@gmail.com',
    userId:   'f1338d3a-20e1-709f-479b-509c9d27690e',
    userName: 'Plantao Debito 2',
    isGoogle: true,
  },
  {
    email:    'juliocezar84@gmail.com',
    userId:   'a1535d2a-c0a1-7028-842f-a5a23fd5cecc',
    userName: 'Julio Vicente',
    isGoogle: false,
  },
  {
    email:    'nicolas.castellani-silva@itau-unibanco.com.br',
    userId:   '61e37d7a-30c1-7098-eb35-5bcf8207d076',
    userName: 'Nicolas Castellani',
    isGoogle: false,
  },
  {
    email:    'alessandra.spioni-estevao@itau-unibanco.com.br',
    userId:   '5163dd9a-30a1-7079-3653-652c63acc629',
    userName: 'Alessandra',
    isGoogle: false,
  },

  // ⚠️  marcelomgabriel@gmail.com aparece duas vezes no export:
  //
  //   1) google_100967830608886687851  sub=d1b32dda-50f1-7083-4aac-5c69a42ecce1  (login Google)
  //   2) f1038d0a-f0c1-7014-cb37-1503e593d349  sub=f1038d0a…  (login e-mail/senha, nome "Marcelo")
  //
  //  Como email é a PK da tabela, só uma pode existir.
  //  Abaixo está a conta Google (mais recentemente modificada: 2025-08-24).
  //  Se os boards/salas foram criados pelo login e-mail/senha, troque o userId
  //  para  f1038d0a-f0c1-7014-cb37-1503e593d349  e mude isGoogle para false.
  {
    email:    'marcelomgabriel@gmail.com',
    userId:   'd1b32dda-50f1-7083-4aac-5c69a42ecce1',   // sub da conta Google
    userName: 'Marcelo Gabriel',
    isGoogle: true,
  },
];

// ─── Montar itens da tabela ───────────────────────────────────────────────────

const buildItem = ({ email, userId, userName, isGoogle }) => ({
  email,
  userId,
  userName,
  userMigrated: true,
  // Usuários Google não precisam definir nova senha → já marcados como migrated
  migrated: isGoogle,
});

// ─── DynamoDB ─────────────────────────────────────────────────────────────────

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION })
);

async function loadTable() {
  const items = COGNITO_USERS.map(buildItem);

  const width = 55;
  console.log('\n' + '═'.repeat(width));
  console.log(` Carregando tabela: ${TABLE}`);
  console.log(` Região:            ${REGION}`);
  console.log(` Usuários:          ${items.length}`);
  if (DRY_RUN) console.log(' Modo:              DRY-RUN (nenhum dado será gravado)');
  console.log('═'.repeat(width) + '\n');

  let ok = 0, fail = 0;

  for (const item of items) {
    const tag  = item.isGoogle ? '[Google]     ' : '[email/senha]';
    const line = `  ${tag} ${item.email}`;

    if (DRY_RUN) {
      console.log(`📋 ${line}`);
      console.log(`      userId=${item.userId}  migrated=${item.migrated}`);
      ok++;
      continue;
    }

    try {
      await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
      console.log(`✅ ${line}`);
      ok++;
    } catch (err) {
      console.error(`❌ ${line}`);
      console.error(`   → ${err.message}`);
      fail++;
    }
  }

  console.log('\n' + '─'.repeat(width));
  console.log(` ${DRY_RUN ? 'Simulados' : 'Inseridos'}: ${ok}   Erros: ${fail}`);
  console.log('─'.repeat(width) + '\n');

  if (fail > 0) process.exit(1);
}

loadTable().catch((err) => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
