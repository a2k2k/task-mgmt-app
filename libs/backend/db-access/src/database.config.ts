import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
    return {
        uri: process.env['DATABASE_URI'] || 'mongodb://mongodb:27017/test',
        user: process.env['DATABASE_USER'],
        password: process.env['DATABASE_PASSWORD']
    };
});
