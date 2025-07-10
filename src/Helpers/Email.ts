import { createTransport } from "nodemailer";
import { Config, ConfigManager, FetcherConfig } from "./ConfigManager.js";
import { Invoice } from "../Fetchers/Invoice.js";

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
     * @param fetcher The configuration for the fetcher that sent this email.
     * @param invoice The invoice data.
     */
    public static async send(fileBuffer: Buffer,
                             fetcher: FetcherConfig,
                             invoice: Invoice) {
        const transport = await this.init();

        const date = new Date(invoice.date);
        const dateStr =
            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        await transport.sendMail({
            from: this.config.email.from,
            to: this.config.email.to,
            attachments: [{
                filename: `${invoice.id}.pdf`,
                content: fileBuffer
            }],
            subject: `${fetcher.friendly}: invoice received`,
            text: `An invoice has been issued by ${
                fetcher.friendly}.\n\nInvoice ID: ${
                invoice.id}\nInvoice date: ${
                dateStr}\n\nAmount incl. VAT: ${invoice.total}`,
        });
    }
}