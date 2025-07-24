import { supabase } from '@/lib/supabase';
import { MessagingEnum } from '@/lib/enums/messaging';
import { createClient } from '@supabase/supabase-js';

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

    if (message.type === MessagingEnum.INVITE_CONFIRMATION) {
      supabase.auth
        .setSession({
          access_token: message.accessToken,
          refresh_token: message.refreshToken,
        })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          return { data, updatePromise: supabase.auth.updateUser({ password: message.password }) };
        })
        .then(({ data, updatePromise }) => {
          return updatePromise.then(({ error: updateError }) => {
            if (updateError) {
              throw updateError;
            }
            console.log('Password set successfully');
            sendResponse({ success: true, session: data.session });
          });
        })
        .catch((error) => {
          console.error('Error setting password:', error);
          sendResponse({ success: false, error: error.message || 'Unknown error' });
        });
      return true;
    }

    sendResponse({ success: false, error: 'Unknown message type' });
    return true;
  });
});
