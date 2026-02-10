import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v7 } from 'uuid';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    try {
      return await this.prisma.user.create({
        data: {
          id: v7(),
          username: dto.username,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException();
      }

      throw e;
    }
  }

  async findAll(): Promise<UserDto[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    try {
      return await this.prisma.user.update({
        where: {
          id,
        },
        data: dto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2025':
            throw new NotFoundException();
          case 'P2002':
            throw new ConflictException();
        }
      }

      throw e;
    }
  }

  async remove(id: string): Promise<UserDto> {
    try {
      return await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException();
      }

      throw e;
    }
  }
}
