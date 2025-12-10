import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CurrentActor, CurrentActorInfo } from '../auth/decorators/current-actor.decorator';
import { ApiKeyPermission } from '../api-keys/dtos/create-api-key.dto';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';
import { PaginationQueryDto } from './dtos/pagination-query.dto';
import { WalletsDocs } from './docs';

@Controller('wallet')
@ApiTags('Wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('deposit')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.DEPOSIT)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  async deposit(
    @Body() depositDto: DepositDto,
    @CurrentUser() user: CurrentUserPayload,
    @CurrentActor() actor: CurrentActorInfo,
  ) {
    return this.walletsService.deposit(user.id, depositDto.amount, actor);
  }

  @Get('balance')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  async getBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.walletsService.getBalance(user.id);
  }

  @Get('my-wallet-number')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @WalletsDocs.getWalletNumber()
  async getWalletNumber(@CurrentUser() user: CurrentUserPayload) {
    return this.walletsService.getWalletNumber(user.id);
  }

  @Post('transfer')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.TRANSFER)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  async transfer(
    @Body() transferDto: TransferDto,
    @CurrentUser() user: CurrentUserPayload,
    @CurrentActor() actor: CurrentActorInfo,
  ) {
    return this.walletsService.transfer(
      user.id,
      transferDto.wallet_number,
      transferDto.amount,
      actor,
    );
  }

  @Get('transactions')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @WalletsDocs.getTransactions()
  async getTransactions(
    @CurrentUser() user: CurrentUserPayload,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.walletsService.getTransactions(
      user.id,
      paginationQuery.page || 1,
      paginationQuery.limit || 20,
    );
  }

  @Get('deposit/:reference/status')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
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
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  async verifyDeposit(
    @Param('reference') reference: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.walletsService.verifyDepositStatus(user.id, reference);
  }
}
