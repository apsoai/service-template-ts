export interface BillingConfig {
  publishKey: string;
  secretKey: string;
  checkoutCancel: string;
  checkoutSuccess: string;
}

export const billing: BillingConfig = {
  secretKey:
    'STRIPE_SECRET_REMOVED',
  publishKey:
    'STRIPE_PUBKEY_REMOVED',
  checkoutCancel: '',
  checkoutSuccess: '',
};
