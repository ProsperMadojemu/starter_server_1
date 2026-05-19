import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../strategies';

interface AuthRequest extends Request {
  user: JwtPayload;
}
//basically a custom decorator that we can use to get the user information from the request object
export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }
    // return data ? user?.[data] : user;
    return user;
  },
);
