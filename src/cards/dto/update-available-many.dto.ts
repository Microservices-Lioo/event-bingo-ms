import { IsUUID } from "class-validator";

export class UpdateAvailableManyDto {
    @IsUUID('4', { each: true })
    ids: string[];
}