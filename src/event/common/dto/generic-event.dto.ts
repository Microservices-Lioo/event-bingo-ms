import { IsOptional, IsEnum, ValidateNested, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dto";
import { StatusEvent } from "../enums";
import { Type } from "class-transformer";

export class PaginationStatusDto {
    @ValidateNested()
    @Type(() => PaginationDto)
    pagination: PaginationDto;

    @IsOptional()
    @IsEnum(StatusEvent, {
        message: 'El status debe ser uno de los siguientes: PENDING, ACTIVE, CANCELLED, COMPLETED'
    })
    status: StatusEvent;
}

export class ParamIdEventUserDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class ParamIdBuyerEventDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    buyer: string;
}