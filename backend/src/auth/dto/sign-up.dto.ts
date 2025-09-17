import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';
export class SignUpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsDefined()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  readonly lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
