import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";
import { UpdateAttributeOptionDto } from "./dto/update-attribute-option.dto";
import { WhereDto } from "./dto/list-attributes-query.dto";

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async pagination(query: WhereDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where: Prisma.AttributeWhereInput = {
      isDeleted: false,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.attribute.findMany({
        where,
        include: {
          options: {
            where: { isDeleted: false },
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
          },
          _count: { select: { options: { where: { isDeleted: false } } } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.attribute.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async detailData(id: string) {
    const item = await this.prisma.attribute.findFirst({
      where: { id, isDeleted: false },
      include: {
        options: {
          where: { isDeleted: false },
          orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        },
      },
    });
    if (!item) throw new NotFoundException("Không tìm thấy thuộc tính.");
    return item;
  }

  loadData() {
    return this.prisma.attribute.findMany({
      where: { isDeleted: false, isActive: true },
      select: { id: true, code: true, name: true, dataType: true },
      orderBy: { name: "asc" },
    });
  }

  async createData(dto: CreateAttributeDto) {
    try {
      return await this.prisma.attribute.create({
        data: { ...dto, unit: dto.unit || null },
      });
    } catch (error) {
      this.handleUnique(error, "Mã thuộc tính đã tồn tại.");
    }
  }

  async updateData(id: string, dto: UpdateAttributeDto) {
    await this.requireAttribute(id);
    try {
      return await this.prisma.attribute.update({ where: { id }, data: dto });
    } catch (error) {
      this.handleUnique(error, "Mã thuộc tính đã tồn tại.");
    }
  }

  async deleteData(id: string) {
    await this.requireAttribute(id);
    await this.prisma.attribute.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
    return { success: true };
  }

  async createOptionData(attributeId: string, dto: CreateAttributeOptionDto) {
    const attribute = await this.requireAttribute(attributeId);
    if (!["SELECT", "MULTI_SELECT"].includes(attribute.dataType))
      throw new ConflictException(
        "Chỉ thuộc tính dạng lựa chọn mới được thêm lựa chọn.",
      );
    try {
      return await this.prisma.attributeOption.create({
        data: { attributeId, ...dto },
      });
    } catch (error) {
      this.handleUnique(error, "Giá trị này đã tồn tại cho thuộc tính.");
    }
  }

  async updateOptionData(
    attributeId: string,
    optionId: string,
    dto: UpdateAttributeOptionDto,
  ) {
    await this.requireAttribute(attributeId);
    await this.requireOption(attributeId, optionId);
    try {
      return await this.prisma.attributeOption.update({
        where: { id: optionId },
        data: dto,
      });
    } catch (error) {
      this.handleUnique(error, "Giá trị này đã tồn tại cho thuộc tính.");
    }
  }

  async deleteOptionData(attributeId: string, optionId: string) {
    await this.requireAttribute(attributeId);
    await this.requireOption(attributeId, optionId);
    await this.prisma.attributeOption.update({
      where: { id: optionId },
      data: { isDeleted: true },
    });
    return { success: true };
  }

  private async requireAttribute(id: string) {
    const item = await this.prisma.attribute.findFirst({
      where: { id, isDeleted: false },
    });
    if (!item) throw new NotFoundException("Không tìm thấy thuộc tính.");
    return item;
  }

  private async requireOption(attributeId: string, optionId: string) {
    const option = await this.prisma.attributeOption.findFirst({
      where: { id: optionId, attributeId, isDeleted: false },
    });
    if (!option)
      throw new NotFoundException("Không tìm thấy lựa chọn thuộc tính.");
    return option;
  }

  private handleUnique(error: unknown, message: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new ConflictException(message);
    throw error;
  }
}
