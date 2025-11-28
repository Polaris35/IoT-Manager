import { isPublic } from '@iot-manager/nest-libs/decorators';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { auth } from '@iot-manager/proto';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authServiceClient: auth.AuthServiceClient;
  onModuleInit() {
    this.authServiceClient = this.client.getService<auth.AuthServiceClient>(
      auth.AUTH_SERVICE_NAME,
    );
  }

  constructor(
    @Inject('AUTH_PACKAGE') private client: ClientGrpc,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const _isPublic = isPublic(context, this.reflector);
    if (_isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const { id, email } = await firstValueFrom(
        this.authServiceClient.validateAccessToken({ accessToken: token }),
      );
      request['user'] = { id, email };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
