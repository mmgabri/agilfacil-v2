'use strict';

const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');
const log = require('../../utils/logger');

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION || 'sa-east-1',
});

const USER_POOL_ID      = process.env.USER_POOL_ID;
const CLIENT_ID         = process.env.CLIENT_ID;
const MIGRATION_SECRET  = process.env.MIGRATION_SECRET;

/**
 * Gera a senha temporária determinística para um usuário migrado.
 * Ninguém conhece esse valor — só o backend consegue calculá-lo.
 * Cumpre a política do pool: ≥8 chars, sem requisito de especiais/números.
 */
const getTempPassword = (email) => {
  return crypto
    .createHmac('sha256', MIGRATION_SECRET)
    .update(email.toLowerCase())
    .digest('hex')
    .slice(0, 16) + 'Aa1!';
};

/**
 * GET /auth/status?email=xxx
 *
 * Retorna o status do usuário no Cognito:
 *   { exists: false }                         → usuário novo, vai para signup normal
 *   { exists: true, status: 'CONFIRMED' }     → usuário existe, vai para login normal
 *   { exists: true, status: 'FORCE_CHANGE_PASSWORD' } → usuário migrado, precisa criar senha
 */
const getAuthStatus = async (email) => {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });
    const response = await client.send(command);
    const attrs = response.UserAttributes || [];
    const getAttr = (name) => (attrs.find(a => a.Name === name)?.Value || '');
    log.debug('getAuthStatus', { email, status: response.UserStatus });
    return { exists: true, status: response.UserStatus, name: getAttr('name') };
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      log.debug('getAuthStatus: usuário não encontrado', { email });
      return { exists: false, status: null };
    }
    throw error;
  }
};

/**
 * POST /auth/set-password
 *
 * Usado somente para usuários em estado FORCE_CHANGE_PASSWORD (pré-migrados).
 *
 * Fluxo:
 *   1. AdminInitiateAuth com a senha temporária (conhecida só pelo backend)
 *   2. AdminRespondToAuthChallenge com a nova senha escolhida pelo usuário
 *
 * Após este endpoint, o frontend chama signIn(email, newPassword) normalmente
 * pelo Amplify — sem nenhum token trafegando pelo backend.
 */
const setPassword = async (email, newPassword) => {
  const tempPassword = getTempPassword(email);

  log.debug('setPassword: iniciando auth', { email });

  const initiateCommand = new AdminInitiateAuthCommand({
    UserPoolId: USER_POOL_ID,
    ClientId:   CLIENT_ID,
    AuthFlow:   'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: tempPassword,
    },
  });

  const initiateResponse = await client.send(initiateCommand);

  if (initiateResponse.ChallengeName !== 'NEW_PASSWORD_REQUIRED') {
    throw new Error(`Challenge inesperado: ${initiateResponse.ChallengeName}`);
  }

  const respondCommand = new AdminRespondToAuthChallengeCommand({
    UserPoolId:  USER_POOL_ID,
    ClientId:    CLIENT_ID,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    Session:     initiateResponse.Session,
    ChallengeResponses: {
      USERNAME:     email,
      NEW_PASSWORD: newPassword,
    },
  });

  await client.send(respondCommand);
  log.info('setPassword: senha definida com sucesso', { email });
  return { success: true };
};

module.exports = { getAuthStatus, setPassword };
