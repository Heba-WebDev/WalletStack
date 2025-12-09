import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dtos/create-api-key.dto';
import { RolloverApiKeyDto } from './dtos/rollover-api-key.dto';
import { ApiKeyResponseDto } from './dtos/api-key-response.dto';
import { ApiKeysDocs } from './docs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('keys')
@ApiTags('API Keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('create')
  @HttpCode(200)
  @ApiKeysDocs.createApiKey()
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ApiKeyResponseDto> {
    return await this.apiKeysService.createApiKey(user.id, createApiKeyDto);
  }

  @Post('rollover')
  @HttpCode(200)
  @ApiKeysDocs.rolloverApiKey()
  async rolloverApiKey(
    @Body() rolloverDto: RolloverApiKeyDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ApiKeyResponseDto> {
    return await this.apiKeysService.rolloverApiKey(user.id, rolloverDto);
  }

  @Get()
  @ApiKeysDocs.getUserApiKeys()
  async getUserApiKeys(@CurrentUser() user: CurrentUserPayload) {
    return await this.apiKeysService.getUserApiKeys(user.id);
  }
}

