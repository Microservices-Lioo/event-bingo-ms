import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class DeleteEventDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  userId: string;
}