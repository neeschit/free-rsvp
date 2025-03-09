import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: true,
  },
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
    sms: true
  },
  accountRecovery: 'PHONE_AND_EMAIL'
}); 