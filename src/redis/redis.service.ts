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
        return await this.client.del(key);
    }

    async hset(key: string, otp: { userId: number, socketId: string }, ttInSeconds?: number): Promise<void> {
        const data = JSON.stringify(otp);

        if (ttInSeconds) {
            await this.client.hset(key, otp.userId, data, 'EX', ttInSeconds);
        } else {
            await this.client.hset(key, otp.userId, data);
        }
        await this.client.hset(`sockets:${otp.socketId}`, 'socketId', otp.socketId, 'key', key);
    }

    async find(key: string, userId: number) {
        return await this.client.hexists(key, JSON.stringify(userId));
    }

    async scard(key: string): Promise<number | null> {
        return this.client.scard(key);
    }

    async hlen(key: string): Promise<number | null> {
        return await this.client.hlen(key);
    }

    async deleteUserRoom(payload: {userId: number, socketId: string}) {
        const { socketId: socket, userId } = payload;
        const { socketId, key } = await this.client.hgetall(`sockets:${socket}`);

        if (key && socketId) {
            await this.client.hdel(key, userId.toString());
            await this.delete(`sockets:${socketId}`);
            return key;
        }

        const len = await this.hlen(key);
        if (len === 0) {
            await this.delete(key);
        }
        return null;
    }

}
