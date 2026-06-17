import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'pkz38.hoster.kz',
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: parseInt(process.env.MAIL_PORT || '465') === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Игнорируем несоответствие сертификата
  tls: { rejectUnauthorized: false },
});

const FROM_NAME = process.env.MAIL_FROM_NAME || 'NIGHTVOLT';
const FROM_EMAIL = process.env.MAIL_FROM || process.env.MAIL_USER || 'your-email@your-domain.com';

export async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #cd792f 0%, #b8661f 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">NIGHTVOLT</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 2px; margin-top: 4px;">LABEL / DISTRIBUTOR</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 8px;">Подтверждение почты</h2>
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
            Добро пожаловать в NIGHTVOLT! Для завершения регистрации введите этот код подтверждения:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #f8f5f2; border: 2px dashed #cd792f; border-radius: 12px; padding: 20px 40px;">
              <span style="font-size: 36px; font-weight: 800; color: #cd792f; letter-spacing: 12px;">${code}</span>
            </div>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center; margin: 0;">
            Код действителен 10 минут.<br>
            Если вы не запрашивали этот код — проигнорируйте письмо.
          </p>
        </div>
        <div style="background: #f8f5f2; padding: 20px 32px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© 2026 NIGHTVOLT. Все права защищены.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Код подтверждения — NIGHTVOLT',
      html,
      text: `Ваш код подтверждения NIGHTVOLT: ${code}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error?.message);
    return { success: false, error: error?.message || 'Ошибка отправки' };
  }
}
