const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const cognitoRegion = 'sa-east-1';
const userPoolId = 'sa-east-1_nYcPqocLt';
const iss = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${userPoolId}`;

const client = jwksClient({
  jwksUri: `${iss}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, null);
    callback(null, key.getPublicKey());
  });
}

// Para uso em Lambda handlers (retorna Promise com o decoded token)
const validateLambdaToken = (authHeader) => {
  return new Promise((resolve, reject) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reject(new Error('Token não fornecido'));
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, getKey, { issuer: iss }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

module.exports = { validateLambdaToken };
