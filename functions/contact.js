import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get('name');
    const email = formData.get('email');
    const parish = formData.get('parish') || 'Not provided';
    const subject = formData.get('subject') || 'Not specified';
    const message = formData.get('message');
    const turnstileToken = formData.get('cf-turnstile-response');

    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!turnstileToken) {
      return new Response(JSON.stringify({
        success: false,
        message: 'CAPTCHA verification failed'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const turnstileVerification = await verifyTurnstileToken(
      turnstileToken,
      context.request.headers.get('CF-Connecting-IP'),
      context
    );

    if (!turnstileVerification.success) {
      return new Response(JSON.stringify({
        success: false,
        message: 'CAPTCHA verification failed'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const region = context.env.AWS_REGION;
    const accessKeyId = context.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = context.env.AWS_SECRET_ACCESS_KEY;
    const fromAddress = context.env.FROM_EMAIL_ADDRESS;
    const toAddress = context.env.TO_EMAIL_ADDRESS;

    if (!region || !accessKeyId || !secretAccessKey || !fromAddress || !toAddress) {
      console.error('Missing env vars:', {
        AWS_REGION: !!region,
        AWS_ACCESS_KEY_ID: !!accessKeyId,
        AWS_SECRET_ACCESS_KEY: !!secretAccessKey,
        FROM_EMAIL_ADDRESS: !!fromAddress,
        TO_EMAIL_ADDRESS: !!toAddress,
      });
      return new Response(JSON.stringify({
        success: false,
        message: 'Server configuration error. Please contact us directly at info@churchify.ie.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const emailParams = {
      Source: fromAddress,
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Subject: {
          Data: `Churchify Contact: ${subject} — ${name}`,
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
    };

    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);

    return new Response(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error?.name, error?.message, error?.stack);

    return new Response(JSON.stringify({
      success: false,
      message: 'Something went wrong. Please try again or email us directly at info@churchify.ie.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function verifyTurnstileToken(token, ip, context) {
  try {
    const formData = new FormData();
    formData.append('secret', context.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    return await result.json();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}
