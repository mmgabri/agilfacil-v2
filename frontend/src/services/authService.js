import axios from 'axios';
import { SERVER_BASE_URL } from '../constants/apiConstants';

/**
 * GET /auth/status?email=xxx
 *
 * Retorna:
 *   { exists: false }                                   → usuário novo
 *   { exists: true, status: 'CONFIRMED' }               → login normal
 *   { exists: true, status: 'FORCE_CHANGE_PASSWORD' }   → precisa criar senha
 */
export const getAuthStatus = async (email) => {
  const { data } = await axios.get(`${SERVER_BASE_URL}/auth/status`, { params: { email } });
  return data;
};

/**
 * POST /auth/set-password
 *
 * Chamado para usuários migrados (FORCE_CHANGE_PASSWORD).
 * O backend resolve o challenge com a senha temporária interna e define a nova senha.
 * Após este retorno, o frontend faz signIn(email, password) normalmente pelo Amplify.
 */
export const setNewPassword = async (email, password) => {
  const { data } = await axios.post(`${SERVER_BASE_URL}/auth/set-password`, { email, password });
  return data;
};
