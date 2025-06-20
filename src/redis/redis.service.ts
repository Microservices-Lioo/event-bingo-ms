import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: '',
            port: 6379
        })
    }

    onModuleDestroy() {
        this.client.quit();
    }

    async set(key: string, otp: string, ttInSeconds: number): Promise<void> {
        await this.client.set(key, otp, 'EX', ttInSeconds);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async delete(key: string): Promise<number> {
        return this.client.del(key);
    }
}
