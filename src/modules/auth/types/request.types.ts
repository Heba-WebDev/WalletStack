import { ApiKey } from '../../api-keys/models/api-key.model';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

declare module 'express' {
  interface Request {
    user?: CurrentUserPayload;
    apiKey?: ApiKey;
  }
}

