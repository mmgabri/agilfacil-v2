import axios from 'axios';
import { SERVER_BASE_URL } from '../constants/apiConstants';

/**
 * GET /user?email=...
 *
 * Retorna { found: false } se 404.
 * Retorna { found: true, userId, userName, migrated } se 200.
 */
export const checkUserMigration = async (email) => {
  try {
    const { data } = await axios.get(`${SERVER_BASE_URL}/user`, { params: { email } });
    return { found: true, ...data };
  } catch (error) {
    if (error.response?.status === 404) return { found: false };
    throw error;
  }
};

/**
 * POST /user/register
 *
 * Chamado após qualquer signup ou login para criar/atualizar o registro
 * e obter o userId efetivo da aplicação.
 *
 * Retorna { userId }
 */
export const registerUserMigration = async ({ email, cognitoSub, userName }) => {
  const { data } = await axios.post(`${SERVER_BASE_URL}/user/register`, {
    email,
    cognitoSub,
    userName,
  });
  return data; // { userId }
};
