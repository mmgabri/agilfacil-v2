// Deriva o ID do usuário autenticado a partir das claims do JWT validado pelo
// API Gateway (JWT authorizer do Cognito, configurado em api_gateway_http.tf).
// Usuários migrados do pool antigo têm custom:legacy_id — mesma regra usada
// no frontend (main/App.js) pra resolver o "userId" real, já que boards
// criados antes da migração usam esse ID legado como creatorId.
const getAuthenticatedUserId = (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  return claims['custom:legacy_id'] || claims.sub;
};

module.exports = { getAuthenticatedUserId };
