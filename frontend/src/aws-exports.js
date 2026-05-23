// ⚠️  Após rodar `terraform apply`, substitua os dois campos marcados com
//    "FILL_AFTER_APPLY" pelos valores dos outputs:
//      terraform output cognito_user_pool_id
//      terraform output cognito_user_pool_client_id

const awsmobile = {
    "aws_project_region": "sa-east-1",
    "aws_cognito_region": "sa-east-1",
    "aws_user_pools_id": "sa-east-1_VBI7mSZY4",
    "aws_user_pools_web_client_id": "2a9oj07kdi3g2rbvf5ncub38m1",
    "oauth": {
        "domain": "agilfacil-prod-1779048899.auth.sa-east-1.amazoncognito.com",
        "scope": [
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "http://localhost:3000/boards",   // 👈 prod: "https://agilfacil.com.br/boards"
        "redirectSignOut": "http://localhost:3000/",         // 👈 prod: "https://agilfacil.com.br/"
        "responseType": "code",
        "options": {
            "prompt": "select_account"
        }
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": ["Google"],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
};

export default awsmobile;
