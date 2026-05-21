import { IsOptional, IsString } from 'class-validator';

export class EditBookMarkDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  link?: string;
  @IsString()
  @IsOptional()
  description?: string;
}
