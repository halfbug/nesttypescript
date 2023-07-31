import { Session } from '@shopify/shopify-api';

export class EventBase {
  public shop: string;
  public accessToken: string;
  public type?: string;
  public session?: Session;
}
