import { Invoice } from "./Invoice.js";
import { Invoices } from "../Helpers/Invoices.js";
import { FetcherConfig } from "../Helpers/ConfigManager.js";
import { Email } from "../Helpers/Email.js";

export abstract class Fetcher {
    /**
     * The configuration for this fetcher.
     * @protected
     */
    protected config: FetcherConfig;

    /**
     * Constructor for Fetcher.
     * @param config The supplied configuration.
     */
    protected constructor(config: FetcherConfig) {
        this.config = config;
    }

    /**
     * Execute this fetcher.
     */
    public async execute(dryRun: boolean = false): Promise<void> {
        if (!await this.validate()) {
            this.log("error", "Pre-validation failed. Not executing this fetcher.");
        }

        if (dryRun) {
            this.log("warn", "DRY RUN: not sending e-mails.");
        }

        // Fetch invoices
        let sentInvoices = 0;
        const invoices = await this.getInvoiceIDs();

        // Do for every invoice ID
        for (const invoiceID of invoices) {
            // Check whether it was already fetched
            if (await Invoices.checkIsFetched(this.config.id, invoiceID)) continue;

            if (!dryRun) {
                // Not dry-running, so fetch document
                const invoice = await this.fetchInvoice(invoiceID);
                if (!invoice) continue; // Error, continue.

                // Send e-mail with this document
                await Email.send(invoice, this.config);
            }

            // Mark as fetched.
            await Invoices.markAsFetched(this.config.id, invoiceID);
            sentInvoices++;
        }

        // Log that we're finished.
        this.log("info", `Sent ${sentInvoices} invoices (${
            invoices.length - sentInvoices} duplicates skipped).`);
    }

    /**
     * Log a message to the console.
     * @param type The type of message to log.
     * @param message The message itself.
     */
    public log(type: "info" | "warn" | "error", ...message: string[]) {
        console[type](`[Fetcher - ${this.config.id}] (${type}) ${message}`);
    }

    /**
     * Run some pre-execute checks to validate whether we can start.
     * @protected
     */
    protected abstract validate(): Promise<boolean>;

    /**
     * Get the available invoices.
     */
    protected abstract getInvoiceIDs(): Promise<string[]>;

    /**
     * Fetch the invoice to a buffer.
     * @param id The invoice ID to fetch.
     */
    protected abstract fetchInvoice(id: string): Promise<Invoice | null>;
}