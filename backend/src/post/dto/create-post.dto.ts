import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsString()
  readonly eventId: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
