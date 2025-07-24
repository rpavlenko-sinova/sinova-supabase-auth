import { type MessagingEnum } from '@/lib/enums/messaging';
import { defineExtensionMessaging } from '@webext-core/messaging';

type TPopupProtocol = {
  [MessagingEnum.AUTH_STATE_CHANGE]: {
    event: string;
    session: any;
  };
  [MessagingEnum.OAUTH_CALLBACK]: {
    code: string;
  };
  [MessagingEnum.EMAIL_CONFIRMATION]: {
    token: string;
  };
};

export const { sendMessage, onMessage } = defineExtensionMessaging<TPopupProtocol>();
