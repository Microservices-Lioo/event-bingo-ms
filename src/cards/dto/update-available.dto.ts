import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateAvailableDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    cardId: string;
}