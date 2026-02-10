import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
});

export class UserDto extends createZodDto(UserSchema) {}
