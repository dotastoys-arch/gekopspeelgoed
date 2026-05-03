import nodemailer from "nodemailer";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface OrderConfirmationData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  category: Category;
  sellingPriceIncl: number;
  address: string;
  postalCode: string;
  city: string;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const { orderId, customerName, customerEmail, category, sellingPriceIncl, address, postalCode, city } = data;

  const categoryLabel = CATEGORY_LABELS[category];
  const categoryEmoji = CATEGORY_EMOJI[category];
  const priceFormatted = sellingPriceIncl.toFixed(2).replace(".", ",");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gekopspeelgoed.nl";

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bestelling bevestigd</title>
</head>
<body style="margin:0;padding:0;background:#F0EDF9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDF9;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:#9B91BE;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
      <p style="margin:0;color:white;font-size:28px;font-weight:900;letter-spacing:-0.5px;">GEK OP ♥ SPEELGOED</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">gekopspeelgoed.nl</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:white;padding:40px;border-radius:0 0 16px 16px;">

      <!-- Hero -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <p style="font-size:52px;margin:0 0 12px;">🎉</p>
            <p style="margin:0;color:#111827;font-size:24px;font-weight:800;">Bestelling bevestigd!</p>
            <p style="margin:10px 0 0;color:#6B7280;font-size:15px;">Hoi ${customerName}, je betaling is ontvangen. Wij gaan aan de slag!</p>
          </td>
        </tr>
      </table>

      <!-- Order summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;padding:0;margin-bottom:20px;">
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;">Jouw bestelling</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6B7280;font-size:14px;padding:5px 0;">Bestelnummer</td>
                <td style="text-align:right;font-weight:700;color:#111827;font-size:14px;">#${orderId}</td>
              </tr>
              <tr>
                <td style="color:#6B7280;font-size:14px;padding:5px 0;">Pakket</td>
                <td style="text-align:right;font-weight:700;color:#111827;font-size:14px;">${categoryLabel} ${categoryEmoji}</td>
              </tr>
              <tr>
                <td style="color:#6B7280;font-size:14px;padding:5px 0;">Inhoud</td>
                <td style="text-align:right;font-size:14px;color:#6B7280;">5–6 speeltjes · verrassing</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:12px 0 4px;border-top:1px solid #E5E7EB;margin-top:8px;"></td>
              </tr>
              <tr>
                <td style="color:#374151;font-size:15px;font-weight:600;padding:4px 0;">Totaal betaald</td>
                <td style="text-align:right;font-weight:900;color:#9B91BE;font-size:20px;">€${priceFormatted}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Delivery address -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;margin-bottom:28px;">
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;">Bezorgadres</p>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
              ${customerName}<br>
              ${address}<br>
              ${postalCode} ${city}<br>
              Nederland
            </p>
          </td>
        </tr>
      </table>

      <!-- What's next -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td>
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;">Wat nu?</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td width="36" style="vertical-align:top;padding-top:2px;">
                  <div style="width:28px;height:28px;background:#EDE9F8;border-radius:50%;text-align:center;line-height:28px;font-size:14px;">📦</div>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#374151;">Wij stellen jouw pakket samen</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#9CA3AF;">5–6 leuke speeltjes, speciaal voor deze categorie</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td width="36" style="vertical-align:top;padding-top:2px;">
                  <div style="width:28px;height:28px;background:#EDE9F8;border-radius:50%;text-align:center;line-height:28px;font-size:14px;">🚀</div>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#374151;">Verstuurd binnen 1–3 werkdagen</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#9CA3AF;">We sturen je een mail zodra je pakket onderweg is</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="36" style="vertical-align:top;padding-top:2px;">
                  <div style="width:28px;height:28px;background:#EDE9F8;border-radius:50%;text-align:center;line-height:28px;font-size:14px;">😊</div>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#374151;">Geniet van de verrassing!</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#9CA3AF;">Elk pakket is uniek samengesteld</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${baseUrl}" style="display:inline-block;background:#9B91BE;color:white;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
              Terug naar de shop
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#9CA3AF;font-size:12px;">
        Vragen? Mail ons op
        <a href="mailto:${process.env.SMTP_USER ?? "dotastoys@gmail.com"}" style="color:#9B91BE;text-decoration:none;">${process.env.SMTP_USER ?? "dotastoys@gmail.com"}</a>
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
    subject: `✅ Bestelling #${orderId} bevestigd — GEK OP SPEELGOED`,
    html,
    text: `Hoi ${customerName}!\n\nJe bestelling #${orderId} is bevestigd.\nPakket: ${categoryLabel}\nBedrag: €${priceFormatted}\n\nWij stellen je pakket samen en versturen het binnen 1-3 werkdagen.\n\nVragen? Mail ons op ${process.env.SMTP_USER ?? "dotastoys@gmail.com"}\n\nGEK OP SPEELGOED`,
  });
}
