'use strict';

/**
 * Cognito Pre Sign-Up trigger
 *
 * Auto-confirma o usuário e marca o e-mail como verificado
 * sem enviar nenhum código de confirmação.
 *
 * A dupla digitação do e-mail é garantida exclusivamente no frontend.
 */
exports.handler = async (event) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
