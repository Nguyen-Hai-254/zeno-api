import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AttributesService } from "./attributes.service";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";
import { UpdateAttributeOptionDto } from "./dto/update-attribute-option.dto";
import { WhereDto } from "./dto/list-attributes-query.dto";

@Controller("attributes")
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get() pagination(@Query() query: WhereDto) {
    return this.service.pagination(query);
  }

  @Get("load-data") loadData() {
    return this.service.loadData();
  }

  @Get(":id") detailData(@Param("id") id: string) {
    return this.service.detailData(id);
  }

  @Post() createData(@Body() dto: CreateAttributeDto) {
    return this.service.createData(dto);
  }

  @Put(":id") updateData(
    @Param("id") id: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.service.updateData(id, dto);
  }

  @Delete(":id") deleteData(@Param("id") id: string) {
    return this.service.deleteData(id);
  }

  @Post(":id/options") createOptionData(
    @Param("id") id: string,
    @Body() dto: CreateAttributeOptionDto,
  ) {
    return this.service.createOptionData(id, dto);
  }

  @Put(":id/options/:optionId") updateOptionData(
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Body() dto: UpdateAttributeOptionDto,
  ) {
    return this.service.updateOptionData(id, optionId, dto);
  }

  @Delete(":id/options/:optionId") deleteOptionData(
    @Param("id") id: string,
    @Param("optionId") optionId: string,
  ) {
    return this.service.deleteOptionData(id, optionId);
  }
}
