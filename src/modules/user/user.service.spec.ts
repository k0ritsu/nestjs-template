import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UserService } from './user.service';

function knownPrismaError(code: string): Prisma.PrismaClientKnownRequestError {
  // Avoid coupling to Prisma runtime constructor signature.
  const err = Object.assign(new Error('prisma error'), {
    code,
  });

  Object.setPrototypeOf(err, Prisma.PrismaClientKnownRequestError.prototype);

  return err as Prisma.PrismaClientKnownRequestError;
}

describe('UserService', () => {
  it('create(): throws ConflictException on P2002', async () => {
    const prisma = {
      user: {
        create: vi.fn().mockRejectedValue(knownPrismaError('P2002')),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(
      service.create({
        username: 'john',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll(): returns users from prisma', async () => {
    const users = [
      {
        id: 'u1',
        username: 'john',
      },
    ];

    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue(users),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(service.findAll()).resolves.toEqual(users);
  });

  it('findOne(): throws NotFoundException when missing', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update(): throws NotFoundException on P2025', async () => {
    const prisma = {
      user: {
        update: vi.fn().mockRejectedValue(knownPrismaError('P2025')),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(
      service.update('missing', {
        username: 'john',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update(): throws ConflictException on P2002', async () => {
    const prisma = {
      user: {
        update: vi.fn().mockRejectedValue(knownPrismaError('P2002')),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(
      service.update('u1', {
        username: 'john',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('remove(): throws NotFoundException on P2025', async () => {
    const prisma = {
      user: {
        delete: vi.fn().mockRejectedValue(knownPrismaError('P2025')),
      },
    } as unknown as PrismaService;

    const service = new UserService(prisma);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
