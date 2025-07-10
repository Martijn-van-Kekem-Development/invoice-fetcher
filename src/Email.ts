import {createTransport, TransportOptions} from "nodemailer";
import {SimyoInvoice} from "./Invoices.js";

export class Email {
    /**
     * Initialize the client
     * @private
     */
    private static init() {
        return createTransport({
            port: process.env.SMTP_PORT ?? 0,
            host: process.env.SMTP_HOST ?? "",
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER ?? "",
                pass: process.env.SMTP_PASS ?? ""
            },
        } as TransportOptions);
    }

    /**
     * Send an e-mail
     * @param fileBuffer The buffer with the invoice.
     * @param invoice The invoice data.
     */
    public static async send(fileBuffer: Buffer, invoice: SimyoInvoice) {
        const transport = this.init();

        const date = new Date(invoice.date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        await transport.sendMail({
            from: process.env.MAIL_FROM ?? "",
            to: process.env.MAIL_TO ?? "",
            attachments: [{
                filename: `${invoice.invoiceNumber}.pdf`,
                content: fileBuffer
            }],
            subject: "Simyo: invoice received",
            text: `An invoice has been issued by Simyo.\n\nInvoice ID: ${
                invoice.invoiceNumber}\nInvoice date: ${
                dateStr}\n\nAmount incl. VAT: ${invoice.total}`,
        });
    }
}