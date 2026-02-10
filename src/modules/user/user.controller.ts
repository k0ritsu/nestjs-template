import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller({
  path: ['users'],
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({
    type: UserDto,
  })
  @Post()
  @SerializeOptions({
    type: UserDto,
  })
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @ApiOkResponse({
    type: [UserDto],
  })
  @Get()
  @SerializeOptions({
    type: UserDto,
  })
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @ApiOkResponse({
    type: UserDto,
  })
  @Get(':id')
  @SerializeOptions({
    type: UserDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @ApiOkResponse({
    type: UserDto,
  })
  @Patch(':id')
  @SerializeOptions({
    type: UserDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.remove(id);
  }
}
