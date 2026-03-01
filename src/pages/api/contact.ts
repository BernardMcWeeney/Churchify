import type { APIRoute } from 'astro';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const defaultErrorMessage = 'Something went wrong. Please try again or email us directly at info@churchify.ie.';
const captchaErrorMessage = 'CAPTCHA verification failed. Please try again.';
export const prerender = import.meta.env.PROD;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyTurnstileToken(token: string, ip: string | null) {
  try {
    const secret = import.meta.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return { success: false };
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    return await result.json();
  } catch {
    return { success: false };
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const parish = formData.get('parish')?.toString().trim() || 'Not provided';
    const subject = formData.get('subject')?.toString().trim() || 'Not specified';
    const message = formData.get('message')?.toString().trim();
    const turnstileToken = formData.get('cf-turnstile-response')?.toString();

    if (!name || !email || !message) {
      return jsonResponse({ success: false, message: 'Missing required fields.' }, 400);
    }

    if (!turnstileToken) {
      return jsonResponse({ success: false, message: captchaErrorMessage }, 400);
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const forwardedIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
    const cfIp = request.headers.get('cf-connecting-ip');
    const clientIp = cfIp || forwardedIp;
    const turnstileVerification = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileVerification.success) {
      return jsonResponse({ success: false, message: captchaErrorMessage }, 400);
    }

    const region = import.meta.env.AWS_REGION;
    const accessKeyId = import.meta.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.AWS_SECRET_ACCESS_KEY;
    const fromAddress = import.meta.env.FROM_EMAIL_ADDRESS;
    const toAddress = import.meta.env.TO_EMAIL_ADDRESS;

    if (!region || !accessKeyId || !secretAccessKey || !fromAddress || !toAddress) {
      return jsonResponse({ success: false, message: defaultErrorMessage }, 500);
    }

    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new SendEmailCommand({
      Source: fromAddress,
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Subject: {
          Data: `Churchify Contact: ${subject} - ${name}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `
Name: ${name}
Email: ${email}
Parish: ${parish}
Subject: ${subject}
Message: ${message}
            `,
            Charset: 'UTF-8',
          },
          Html: {
            Data: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Parish:</strong> ${parish}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong> ${message}</p>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    });

    await sesClient.send(command);

    return jsonResponse({
      success: true,
      message: "Thank you for your message! We'll be in touch shortly.",
    });
  } catch {
    return jsonResponse({ success: false, message: defaultErrorMessage }, 500);
  }
};
