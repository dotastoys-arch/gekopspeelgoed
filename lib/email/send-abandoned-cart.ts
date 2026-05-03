import nodemailer from "nodemailer";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface AbandonedCartData {
  customerName: string;
  customerEmail: string;
  category: Category;
  discountToken: string;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendAbandonedCartEmail(data: AbandonedCartData): Promise<void> {
  const { customerName, customerEmail, category, discountToken } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gekopspeelgoed.nl";
  const resumeUrl = `${baseUrl}/bestellen/${category}?token=${discountToken}`;
  const categoryLabel = CATEGORY_LABELS[category];
  const categoryEmoji = CATEGORY_EMOJI[category];

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F0EDF9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDF9;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr>
    <td style="background:#9B91BE;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
      <p style="margin:0;color:white;font-size:28px;font-weight:900;">GEK OP ♥ SPEELGOED</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">gekopspeelgoed.nl</p>
    </td>
  </tr>

  <tr>
    <td style="background:white;padding:40px;border-radius:0 0 16px 16px;">

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <p style="font-size:52px;margin:0 0 12px;">🛒</p>
            <p style="margin:0;color:#111827;font-size:24px;font-weight:800;">Je bent iets vergeten, ${customerName}!</p>
            <p style="margin:12px 0 0;color:#6B7280;font-size:15px;line-height:1.6;">
              Je was bezig met een <strong>${categoryLabel} ${categoryEmoji}</strong> pakket.<br>
              Maak je bestelling af en krijg <strong style="color:#F06060;">10% korting</strong>!
            </p>
          </td>
        </tr>
      </table>

      <!-- Discount badge -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="background:linear-gradient(135deg,#F06060,#E04040);border-radius:16px;padding:24px;text-align:center;">
            <p style="margin:0;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Jouw exclusieve korting</p>
            <p style="margin:8px 0 0;color:white;font-size:48px;font-weight:900;">10% KORTING</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
              Van <s>€34,95</s> voor slechts <strong>€31,46</strong>
            </p>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:12px;">Korting wordt automatisch toegepast</p>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="${resumeUrl}" style="display:inline-block;background:#F06060;color:white;padding:18px 48px;border-radius:14px;text-decoration:none;font-weight:800;font-size:17px;">
              🎁 Bestel nu met 10% korting →
            </a>
          </td>
        </tr>
      </table>

      <!-- Why us -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;margin-bottom:24px;">
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;">Waarom GEK OP SPEELGOED?</p>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;">✅ Goedkoper dan in de winkel of online</p>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;">✅ 5–6 speeltjes voor slechts €34,95</p>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;">✅ Gratis cadeau naar keuze</p>
            <p style="margin:0;font-size:14px;color:#374151;">✅ Uniek samengesteld, elke keer anders</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
        Wil je geen mails meer ontvangen?
        <a href="${baseUrl}/uitschrijven?token=${discountToken}" style="color:#9B91BE;">Uitschrijven</a>
      </p>

    </td>
  </tr>

  <tr>
    <td style="padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#9CA3AF;font-size:12px;">
        Vragen? <a href="mailto:${process.env.SMTP_USER ?? "dotastoys@gmail.com"}" style="color:#9B91BE;">${process.env.SMTP_USER ?? "dotastoys@gmail.com"}</a>
      </p>
      <p style="margin:6px 0 0;color:#D1D5DB;font-size:11px;">GEK OP SPEELGOED · gekopspeelgoed.nl</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `GEK OP SPEELGOED <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `🛒 Je bent iets vergeten — 10% korting voor jou, ${customerName}!`,
    html,
    text: `Hoi ${customerName}!\n\nJe was bezig met een ${categoryLabel} pakket. Maak je bestelling af en krijg 10% korting!\n\nBestel hier: ${resumeUrl}\n\nGEK OP SPEELGOED`,
  });
}
