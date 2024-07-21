import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log("Database connected.");
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalRecords = await this.product.count({ where: { status: 'E' } });
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status: 'E' },
      }),
      meta: {
        total: totalRecords,
        page,
        lastPage: Math.ceil(totalRecords / limit),
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, status: 'E' }
    });
    if (!product) {
      throw new RpcException({status:404, message:`Product with id #${id} not found.`});
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { id: __, ...data } = updateProductDto;
      return await this.product.update({
        where: { id, status: 'E' },
        data: data
      })
    } catch (error) {
      throw new RpcException(`Error updating product`);
    }
  }

  async remove(id: number) {
    try {
      return await this.product.update({
        where: { id, status: 'E' },
        data: {
          status: 'D'
        }
      })
    } catch (error) {
      throw new RpcException(`Error deleting product`);
    }
  }
}
