/**
 * Resend email client.
 *
 * Thin wrapper around the Resend REST API for transactional email delivery.
 * Also exports a helper that builds the branded HTML email used for new-alert
 * notifications.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

export interface SendEmailResult {
    success: boolean;
    id?: string;
    error?: string;
}

// Minimal shape of the data we need from the DB rows
export interface AlertSummary {
    id: string;
    type: "construction" | "extension" | "annexe" | "piscine";
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    confidence: number | null;
    address: string | null;
    detectedArea: number | null;
}

export interface MunicipalitySummary {
    id: string;
    name: string;
}

// ---------------------------------------------------------------------------
// sendEmail
// ---------------------------------------------------------------------------

const FROM_ADDRESS = "Observatoire 360 <alerts@observatoire360.com>";
const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send a transactional email via the Resend API.
 *
 * @param apiKey  - Resend API key (from `env.RESEND_API_KEY`).
 * @param options - Recipient(s), subject and pre-rendered HTML body.
 */
export async function sendEmail(
    apiKey: string,
    options: EmailOptions,
): Promise<SendEmailResult> {
    const payload = {
        from: FROM_ADDRESS,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    let response: Response;
    try {
        response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: `Network error: ${message}` };
    }

    if (!response.ok) {
        const text = await response.text();
        return {
            success: false,
            error: `Resend API error (${response.status}): ${text}`,
        };
    }

    const data = (await response.json()) as { id?: string };
    return { success: true, id: data.id };
}

// ---------------------------------------------------------------------------
// buildAlertEmailHtml
// ---------------------------------------------------------------------------

const RISK_LABEL: Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
};

const RISK_COLOR: Record<string, string> = {
    low: "#16a34a",
    medium: "#d97706",
    high: "#dc2626",
};

const TYPE_LABEL: Record<string, string> = {
    construction: "Construction",
    extension: "Extension",
    annexe: "Annexe",
    piscine: "Piscine",
};

/**
 * Build a branded HTML email body for a new-alert notification.
 *
 * @param alert        - Alert row (or projection) containing detection data.
 * @param municipality - Municipality the alert belongs to.
 * @param dashboardUrl - Deep-link URL to the alert in the dashboard.
 */
export function buildAlertEmailHtml(
    alert: AlertSummary,
    municipality: MunicipalitySummary,
    dashboardUrl = "https://observatoire360.com/dashboard",
): string {
    const riskLabel = RISK_LABEL[alert.riskLevel] ?? alert.riskLevel;
    const riskColor = RISK_COLOR[alert.riskLevel] ?? "#6b7280";
    const typeLabel = TYPE_LABEL[alert.type] ?? alert.type;
    const confidencePct =
        alert.confidence !== null
            ? `${Math.round(alert.confidence * 100)} %`
            : "N/A";
    const area =
        alert.detectedArea !== null
            ? `${alert.detectedArea.toFixed(1)} m²`
            : "N/A";
    const address = alert.address ?? "Adresse non disponible";
    const alertUrl = `${dashboardUrl}/alerts/${alert.id}`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle détection — Observatoire 360</title>
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0d9488; padding: 28px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #ccfbf1; }
    .body { padding: 28px 32px; }
    .body h2 { margin: 0 0 20px; font-size: 18px; color: #111827; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .detail-row:last-of-type { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: #ffffff; background: ${riskColor}; }
    .cta { text-align: center; margin: 28px 0 0; }
    .cta a { display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 6px; font-size: 15px; font-weight: 600; }
    .footer { background: #f9fafb; padding: 18px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Observatoire 360</h1>
      <p>Plateforme de surveillance du territoire</p>
    </div>
    <div class="body">
      <h2>Nouvelle détection dans ${escapeHtml(municipality.name)}</h2>
      <div class="detail-row">
        <span class="detail-label">Type de détection</span>
        <span class="detail-value">${escapeHtml(typeLabel)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Niveau de risque</span>
        <span class="detail-value"><span class="badge">${escapeHtml(riskLabel)}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Adresse</span>
        <span class="detail-value">${escapeHtml(address)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Surface détectée</span>
        <span class="detail-value">${escapeHtml(area)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Score de confiance IA</span>
        <span class="detail-value">${escapeHtml(confidencePct)}</span>
      </div>
      <div class="cta">
        <a href="${alertUrl}">Voir dans le tableau de bord</a>
      </div>
    </div>
    <div class="footer">
      Vous recevez ce message car vous êtes gestionnaire sur Observatoire 360.<br />
      &copy; ${new Date().getFullYear()} Observatoire 360 — Tous droits réservés.
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
