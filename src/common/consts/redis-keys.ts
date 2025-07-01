import { StatusEvent } from "@prisma/client";
import { RedisCacheEnum } from "../enums";

export const RedisKeys = {
    EVENT_ID: (id: number) => `${RedisCacheEnum.EVENT}:${id}`,
    EVENT_ID_USER_ID: (id: number, userId: number) => `${RedisCacheEnum.EVENT}:${id}:${userId}`,
    EVENT_ID_USER_ID_WITH_AWARDS: (id: number, userId: number) => `${RedisCacheEnum.EVENT}:${id}:${userId}:awards`,
    EVENT_ID_WITH_AWARDS: (id: number) => `${RedisCacheEnum.EVENT}:${id}:awards`,

    // Para listas paginadas
    EVENTS_BY_STATUS: (status: StatusEvent, page: number, limit: number) => 
    `${RedisCacheEnum.EVENTS}:status:${status}:page:${page}:limit:${limit}`,
    
    EVENTS_BY_USER_BY_STATUS: (userId: number, status: StatusEvent, page: number, limit: number) => 
    `${RedisCacheEnum.EVENTS}:user:${userId}:status:${status}:page:${page}:limit:${limit}`,

    EVENTS_BY_USER: (userId: number, page: number, limit: number) => 
    `${RedisCacheEnum.EVENTS}:user:${userId}:page:${page}:limit:${limit}`,
    
    EVENTS_BY_USER_WITH_AWARDS: (userId: number, page: number, limit: number) => 
    `${RedisCacheEnum.EVENTS}:awards:user:${userId}:page:${page}:limit:${limit}`,

    // Para el total de las listas
    EVENTS_COUNT_BY_STATUS: (status: StatusEvent) => 
    `${RedisCacheEnum.EVENTS}:count:status:${status}`,

    EVENTS_COUNT_BY_USER: (userId: number) => 
    `${RedisCacheEnum.EVENTS}:count:user:${userId}`,
    
    EVENTS_COUNT_BY_USER_WITH_AWARDS: (userId: number) => 
    `${RedisCacheEnum.EVENTS}:count:awards:user:${userId}`,

    // Para invalidar todas los events
    EVENTS_STATUS_PATTERN: `${RedisCacheEnum.EVENTS}:*`,
}