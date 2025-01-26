import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class DeleteDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    id: number;
}