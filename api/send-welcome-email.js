import { createTransporter, FROM } from "./_mailer.js";

const APP_URL = process.env.APP_URL || "https://eazy.app";

function buildWelcomeHtml(name, appUrl) {
  const arrowSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10"/><path d="M9 4l4 4-4 4"/></svg>`;
  const igSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="#94a3b8" stroke="none"/></svg>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Bem-vindo(a) à Eazy</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 40px;text-align:center;border-radius:16px 16px 0 0;">
              <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#64748b;">Tranquilidade Financeira. Assim Fácil.</p>
              <p style="margin:0;font-size:34px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;line-height:1;">eazy</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 36px;">
              <h2 style="margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3;">Oi, ${name}!</h2>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#334155;">Seja muito bem-vindo(a) ao Eazy.<br>Estamos animados que você optou pela tranquilidade financeira que é ser Eazy.</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#334155;">Criamos uma plataforma completa para você parar de se preocupar diariamente com seus gastos: um controle financeiro para quem não tem controle kkkkk</p>

              <!-- Feature box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-left:3px solid #22c55e;background-color:#f8fafc;border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#0f172a;">Com a Eazy, você pode:</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">ver tudo em um só lugar, entender para onde seu dinheiro vai, definir até onde pode ir (limitar seus gastos por categoria) e saber na hora se pode gastar com algo neste mês.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">SIMPLES ASSIM.</p>

              <p style="margin:0 0 20px 0;font-size:15px;color:#334155;">Clique aqui para acessar sua conta:</p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="background-color:#0f172a;border-radius:50px;">
                    <a href="${appUrl}" style="display:inline-block;text-decoration:none;padding:0;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:13px 14px 13px 22px;vertical-align:middle;">
                            <span style="font-size:15px;font-weight:600;color:#ffffff;white-space:nowrap;">Acessar minha conta</span>
                          </td>
                          <td style="padding:13px 20px 13px 8px;vertical-align:middle;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="width:30px;height:30px;background-color:#22c55e;border-radius:50%;text-align:center;vertical-align:middle;line-height:30px;">
                                  ${arrowSvg}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px 0;font-size:14px;color:#475569;">Estamos aqui para te ajudar no que for necessário.</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Do time da Eazy</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 32px;border-radius:0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #e2e8f0;padding-top:24px;"></td></tr>
                <tr>
                  <td align="center" style="padding-bottom:10px;">${igSvg}</td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">Eazy Tranquilidade Financeira para Jovens</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      <a href="${appUrl}/faq" style="color:#64748b;text-decoration:none;">Entre em contato</a>
                      <span style="color:#cbd5e1;margin:0 8px;">|</span>
                      <a href="${appUrl}/terms" style="color:#64748b;text-decoration:none;">Termos de Uso</a>
                      <span style="color:#cbd5e1;margin:0 8px;">|</span>
                      <a href="${appUrl}/settings" style="color:#64748b;text-decoration:none;">Desinscreva-se</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email" });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD is not set");
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Bem-vindo(a) à Eazy! 🎉",
      html: buildWelcomeHtml(name, APP_URL),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send welcome email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
