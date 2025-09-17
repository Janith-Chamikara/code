import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsUUID()
  readonly eventId: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
