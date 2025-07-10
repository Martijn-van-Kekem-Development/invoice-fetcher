import {createTransport} from "nodemailer";
import {SimyoInvoice} from "./Invoices.js";
import {Config, ConfigManager} from "./ConfigManager.js";

export class Email {
    /**
     * The configuration.
     * @private
     */
    private static config: Config;

    /**
     * Initialize the client
     * @private
     */
    private static async init() {
        this.config = await ConfigManager.get();
        return createTransport(this.config.email.smtp);
    }

    /**
     * Send an e-mail
     * @param fileBuffer The buffer with the invoice.
     * @param invoice The invoice data.
     */
    public static async send(fileBuffer: Buffer, invoice: SimyoInvoice) {
        const transport = await this.init();

        const date = new Date(invoice.date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        await transport.sendMail({
            from: this.config.email.from,
            to: this.config.email.to,
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