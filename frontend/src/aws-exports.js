const awsmobile = {
    "aws_project_region": "ap-south-1",
    "aws_cognito_region": "ap-south-1",
    "aws_user_pools_id": "ap-south-1_nYcPqocLt",
    "aws_user_pools_web_client_id": "23uraqpbg5r0ljdt2bf016kr6m",
    "oauth": {
        "domain": "agilfacilamplifyf27aefbc-f27aefbc-dev.auth.ap-south-1.amazoncognito.com",
        "scope": [
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "https://agilfacil.com.br/boards",
        "redirectSignOut": "https://agilfacil.com.br/",
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