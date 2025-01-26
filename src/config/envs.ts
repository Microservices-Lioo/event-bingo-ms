import 'dotenv/config';
import * as env from'env-var';

interface EnvVar {
    PORT: number;
    DATABASE_URL: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    // JWT_SECRET: string;
    // JWT_EXPIRATION: string;    
    // JWT_REFRESH_SECRET: string;
    // JWT_REFRESH_EXPIRATION: string;
}

export const envs: EnvVar = {
    PORT: env.get('PORT').required().asPortNumber(),
    DATABASE_URL: env.get('DATABASE_URL').required().asString(),
    POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
    POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
    POSTGRES_DB: env.get('POSTGRES_DB').required().asString(),
    // JWT_SECRET: env.get('JWT_SECRET').required().asString(),
    // JWT_EXPIRATION: env.get('JWT_EXPIRATION').required().asString(),
    // JWT_REFRESH_SECRET: env.get('JWT_REFRESH_SECRET').required().asString(),
    // JWT_REFRESH_EXPIRATION: env.get('JWT_REFRESH_EXPIRATION').required().asString(),
}