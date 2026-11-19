import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { AttributeDataType } from "@prisma/client";

export class CreateAttributeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/)
  @MaxLength(60)
  code!: string;

  @IsEnum(AttributeDataType)
  dataType!: AttributeDataType;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
