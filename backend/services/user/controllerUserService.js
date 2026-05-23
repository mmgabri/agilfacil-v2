'use strict';

const { getUserMigrationByEmail, putTable } = require('../database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

/**
 * GET /user?email=...
 *
 * Retorna null se o e-mail não existir na tabela.
 * Retorna { userId, userName, migrated } se existir.
 *
 * O campo `migrated` da resposta indica se o usuário já concluiu o cadastro
 * no novo sistema. Para usuários vindos do Cognito antigo (userMigrated=true)
 * que ainda não definiram nova senha (migrated=false), retorna migrated=false
 * e o frontend exibe a tela de boas-vindas. Todos os demais casos retornam true.
 */
const checkEmail = async (email) => {
  log.debug('checkEmail', { email });
  const item = await getUserMigrationByEmail(config.TABLE_USERS, email);
  if (!item) return null;

  return {
    userId:   item.userId,
    userName: item.userName,
    migrated: item.userMigrated ? item.migrated : true,
  };
};

/**
 * POST /user/register
 *
 * Chamado sempre após signup ou login para criar/atualizar o registro
 * e devolver o userId efetivo da aplicação.
 *
 * Regras:
 *  - Email existe + userMigrated=true → setar migrated=true, salvar cognitoSub
 *  - Caso contrário                   → criar/atualizar com userId=cognitoSub,
 *                                        userMigrated=false
 */
const registerUser = async ({ email, cognitoSub, userName }) => {
  log.debug('registerUser', { email, cognitoSub });

  const existing = await getUserMigrationByEmail(config.TABLE_USERS, email);

  let item;
  if (existing && existing.userMigrated === true) {
    // Usuário migrado concluindo o cadastro de nova senha
    item = {
      ...existing,
      cognitoSub,
      migrated: true,
    };
  } else {
    // Novo usuário ou usuário já do novo sistema
    item = {
      email,
      userId:       existing?.userId || cognitoSub,
      userName:     userName || existing?.userName || '',
      userMigrated: false,
      migrated:     false,
      cognitoSub,
    };
  }

  await putTable(config.TABLE_USERS, item);
  log.debug('registerUser success', { email, userId: item.userId });
  return { userId: item.userId };
};

module.exports = { checkEmail, registerUser };
