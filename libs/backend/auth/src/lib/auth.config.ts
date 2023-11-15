import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => {
    return {
        jwt: {
            secret: process.env['JWT_SECRET'] || 'THIS SHOULD BE REPLACED WITH A STRONG SECRET OUTSIDE OF CODEBASE',
            access_token_expiry: 3600,
            refresh_token_expiry: 86400
        }
    };
});