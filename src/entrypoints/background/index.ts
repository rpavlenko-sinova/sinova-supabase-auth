import { supabase } from '@/lib/supabase';
import { MessagingEnum } from '@/lib/enums/messaging';

export default defineBackground(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    browser.runtime
      .sendMessage({
        type: 'AUTH_STATE_CHANGE',
        event,
        session,
      })
      .catch((error) => {
        if (error.message.includes('Receiving end does not exist')) {
          console.debug('No clients listening for auth state change');
        } else {
          console.error('Error sending auth state change message:', error);
        }
      });
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === MessagingEnum.OAUTH_CALLBACK) {
      supabase.auth.exchangeCodeForSession(message.code).then(({ data, error }) => {
        if (error) {
          sendResponse({ success: false, error });
        } else {
          sendResponse({ success: true, session: data.session });
        }
      });
      return true;
    }

    if (message.type === MessagingEnum.EMAIL_CONFIRMATION) {
      supabase.auth
        .verifyOtp({
          token_hash: message.token,
          type: 'signup',
        })
        .then(({ data, error }) => {
          if (error) {
            sendResponse({ success: false, error: error.message });
          } else {
            sendResponse({ success: true, session: data.session });
          }
        })
        .catch((err) => {
          sendResponse({ success: false, error: err.message || 'Unknown error' });
        });
      return true;
    }

    sendResponse({ success: false, error: 'Unknown message type' });
    return true;
  });
});
