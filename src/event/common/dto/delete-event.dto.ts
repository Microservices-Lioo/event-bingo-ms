import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class DeleteEventDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    id: number;
}