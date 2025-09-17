import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserAgent = createParamDecorator(
  (_key: string, context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.headers['user-agent'];
  },
);
