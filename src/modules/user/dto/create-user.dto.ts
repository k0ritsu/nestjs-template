import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().trim().nonempty(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
