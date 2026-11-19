import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
export class UpdateAttributeOptionDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) value?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) label?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
