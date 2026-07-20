import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@4.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "";
const appName = "ALAYAA";

function htmlLayout(title: string, body: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#FAF9F6; padding:24px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #E5E7EB; border-radius:24px; overflow:hidden;">
        <div style="background:#134E4A; color:#fff; padding:28px 32px;">
          <div style="font-size:12px; letter-spacing:.18em; text-transform:uppercase; opacity:.75;">${appName}</div>
          <div style="font-size:28px; line-height:1.2; font-weight:800; margin-top:8px;">${title}</div>
        </div>
        <div style="padding:32px; color:#1F2937; font-size:15px; line-height:1.75;">
          ${body}
        </div>
      </div>
    </div>
  `;
}

function esc(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendMail(to: string, subject: string, html: string) {
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }
  return await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { type, payload } = await req.json();

    if (!type) {
      throw new Error("Email type is required");
    }

    let to = "";
    let subject = "";
    let body = "";

    switch (type) {
      case "welcome":
        to = payload.to;
        subject = "Welcome to ALAYAA";
        body = `
          <p>Hi ${esc(payload.fullName || "there")},</p>
          <p>Welcome to ALAYAA. Your ${esc(payload.role || "customer")} account is ready.</p>
          <p>You can sign in after verifying your email address.</p>
        `;
        break;
      case "broker_approved":
        to = payload.to;
        subject = "Your broker account is approved";
        body = `
          <p>Hi ${esc(payload.fullName || "Broker")},</p>
          <p>Your broker account has been approved. You can now publish and manage properties.</p>
        `;
        break;
      case "broker_rejected":
        to = payload.to;
        subject = "Your broker application was not approved";
        body = `
          <p>Hi ${esc(payload.fullName || "Broker")},</p>
          <p>Your broker application was not approved at this time. Please contact the ALAYAA team if you need help.</p>
        `;
        break;
      case "enquiry":
        to = payload.to;
        subject = `New enquiry for ${esc(payload.propertyTitle || "your property")}`;
        body = `
          <p>You have received a new enquiry.</p>
          <p><strong>Property:</strong> ${esc(payload.propertyTitle || "")}</p>
          <p><strong>Customer:</strong> ${esc(payload.customerName || "")} (${esc(payload.customerEmail || "")})</p>
          <p><strong>Message:</strong></p>
          <p>${esc(payload.message || "")}</p>
        `;
        break;
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    if (!to) {
      throw new Error("Recipient email is required");
    }

    await sendMail(to, subject, htmlLayout(subject, body));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

