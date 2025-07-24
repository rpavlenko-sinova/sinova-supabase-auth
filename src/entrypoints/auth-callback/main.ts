import { MessagingEnum } from '@/lib/enums/messaging';

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');
const token = urlParams.get('token');
const type = urlParams.get('type');

const statusElement = document.getElementById('status');

if (!statusElement) {
  throw new Error('Status element not found');
}

async function handleOAuthCallback(code: string): Promise<void> {
  statusElement!.textContent = 'Processing OAuth authentication...';

  try {
    const response = await new Promise<any>((resolve) => {
      browser.runtime.sendMessage(
        {
          type: MessagingEnum.OAUTH_CALLBACK,
          code,
        },
        resolve,
      );
    });

    if (response.success) {
      statusElement!.textContent = 'Authentication successful! You can close this window.';
      setTimeout(() => window.close(), 2000);
    } else {
      statusElement!.textContent = 'Authentication failed: ' + response.error;
      setTimeout(() => window.close(), 3000);
    }
  } catch (err) {
    statusElement!.textContent = 'Authentication failed: ' + (err as Error).message;
    setTimeout(() => window.close(), 3000);
  }
}

async function handleEmailConfirmation(token: string): Promise<void> {
  statusElement!.textContent = 'Confirming your email...';

  try {
    const response = await new Promise<any>((resolve) => {
      browser.runtime.sendMessage(
        {
          type: MessagingEnum.EMAIL_CONFIRMATION,
          token,
        },
        resolve,
      );
    });

    if (response.success) {
      statusElement!.textContent =
        'Email confirmed successfully! You can close this window and sign in to your extension.';
      setTimeout(() => window.close(), 3000);
    } else {
      statusElement!.textContent = 'Email confirmation failed: ' + response.error;
      setTimeout(() => window.close(), 3000);
    }
  } catch (err) {
    statusElement!.textContent = 'Email confirmation failed: ' + (err as Error).message;
    setTimeout(() => window.close(), 3000);
  }
}

// Main execution
if (error) {
  statusElement!.textContent = 'Authentication failed: ' + error;
  setTimeout(() => window.close(), 3000);
} else if (code) {
  handleOAuthCallback(code);
} else if (token && type === 'signup') {
  handleEmailConfirmation(token);
} else {
  statusElement!.textContent = 'Invalid authentication request.';
  setTimeout(() => window.close(), 2000);
}
