import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ApiKeyPermission } from '../api-keys/dtos/create-api-key.dto';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';

@Controller('wallet')
@ApiTags('Wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('deposit')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.DEPOSIT)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async deposit(
    @Body() depositDto: DepositDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.walletsService.deposit(user.id, depositDto.amount);
  }

  @Get('balance')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async getBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.walletsService.getBalance(user.id);
  }

  @Post('transfer')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.TRANSFER)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async transfer(
    @Body() transferDto: TransferDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.walletsService.transfer(
      user.id,
      transferDto.wallet_number,
      transferDto.amount,
    );
  }

  @Get('transactions')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async getTransactions(@CurrentUser() user: CurrentUserPayload) {
    return this.walletsService.getTransactions(user.id);
  }

  @Get('deposit/:reference/status')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async getDepositStatus(
    @Param('reference') reference: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.walletsService.getDepositStatus(user.id, reference);
  }

  @Post('paystack/webhook')
  // No authentication - webhook from Paystack (will be verified by signature)
  async paystackWebhook(
    @Body() webhookData: any,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: any,
  ) {
    // Get raw body from request (set by middleware in main.ts)
    const rawBody = (req as any).rawBody;
    return this.walletsService.handlePaystackWebhook(webhookData, signature, rawBody);
  }

  @Post('deposit/:reference/verify')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.DEPOSIT)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for service-to-service access (alternative to JWT)',
    required: false,
  })
  async verifyDeposit(
    @Param('reference') reference: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.walletsService.verifyAndProcessDeposit(user.id, reference);
  }
}
