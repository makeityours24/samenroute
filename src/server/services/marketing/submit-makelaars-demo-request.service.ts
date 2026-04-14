import { env } from "@/lib/env/env";
import { AppError } from "@/server/services/errors";
import { z } from "zod";

const recipientEmail = "info@samenroute.nl";

const submitMakelaarsDemoRequestSchema = z.object({
  name: z.string().trim().min(2, "Vul je naam in."),
  officeName: z.string().trim().min(2, "Vul de naam van je kantoor in."),
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  city: z.string().trim().optional(),
  weeklyViewings: z.string().trim().optional(),
  notes: z.string().trim().max(2000, "Je notitie is te lang.").optional()
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function submitMakelaarsDemoRequestService(input: {
  name: string;
  officeName: string;
  email: string;
  city?: string;
  weeklyViewings?: string;
  notes?: string;
}) {
  const data = submitMakelaarsDemoRequestSchema.parse(input);

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    throw new AppError("E-mailverzending voor demo-aanvragen is nog niet ingesteld.");
  }

  const transport = await import("nodemailer").then((module) =>
    module.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      }
    })
  );

  const lines = [
    `Naam: ${data.name}`,
    `Kantoor: ${data.officeName}`,
    `E-mail: ${data.email}`,
    `Stad/regio: ${data.city || "-"}`,
    `Bezichtigingen per week: ${data.weeklyViewings || "-"}`,
    "",
    "Notitie:",
    data.notes || "-"
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#171612">
      <h2>Nieuwe demo-aanvraag via makelaars.samenroute.nl</h2>
      <p><strong>Naam:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Kantoor:</strong> ${escapeHtml(data.officeName)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Stad/regio:</strong> ${escapeHtml(data.city || "-")}</p>
      <p><strong>Bezichtigingen per week:</strong> ${escapeHtml(data.weeklyViewings || "-")}</p>
      <p><strong>Notitie:</strong><br />${escapeHtml(data.notes || "-").replaceAll("\n", "<br />")}</p>
    </div>
  `;

  try {
    await transport.sendMail({
      to: recipientEmail,
      from: env.EMAIL_FROM,
      replyTo: data.email,
      subject: `Nieuwe demo-aanvraag: ${data.officeName}`,
      text: lines.join("\n"),
      html
    });
  } catch (error) {
    console.error("Failed to send makelaars demo request", error);
    throw new AppError("De demo-aanvraag kon niet worden verstuurd.");
  }
}
