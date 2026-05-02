import { Router, Request, Response } from "express";
import { pool } from "../../config/db";
import { env } from "../../config/env";

const router = Router();

/**
 * Paystation callback — handles both GET redirect (user returns from payment page)
 * and POST webhook (Paystation server-side notification).
 *
 * Paystation sends: invoice_number, payment_status ("Successful" | "Failed" | "Cancelled")
 */
async function handleCallback(req: Request, res: Response) {
  const params = { ...req.query, ...req.body } as Record<string, string>;

  const invoiceNumber = params.invoice_number || params.invoiceNumber;
  const rawStatus = (params.payment_status || params.paymentStatus || "").toLowerCase();

  const isSuccess =
    rawStatus === "successful" || rawStatus === "success" || rawStatus === "paid";

  if (invoiceNumber) {
    try {
      if (isSuccess) {
        await pool.query(
          `UPDATE orders SET payment_status = 'paid', status = 'paid'
           WHERE order_number = ?`,
          [invoiceNumber]
        );
      } else {
        await pool.query(
          `UPDATE orders SET payment_status = 'failed'
           WHERE order_number = ?`,
          [invoiceNumber]
        );
      }
    } catch {
      /* non-fatal — still redirect */
    }
  }

  const base = env.frontendUrl;
  const redirectUrl = isSuccess
    ? `${base}/payment/success?order=${invoiceNumber ?? ""}`
    : `${base}/payment/failed?order=${invoiceNumber ?? ""}`;

  res.redirect(redirectUrl);
}

router.get("/callback", (req, res) => { void handleCallback(req, res); });
router.post("/callback", (req, res) => { void handleCallback(req, res); });

export default router;
