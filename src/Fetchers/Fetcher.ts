import {Invoice} from "./Invoice.js";
import {Invoices} from "../Helpers/Invoices.js";
import {FetcherConfig} from "../Helpers/ConfigManager.js";
import {Email} from "../Helpers/Email.js";

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
    public async execute() {
        if (!await this.validate()) {
            this.log("error", "Pre-validation failed. Not executing this fetcher.");
        }

        const invoices = await this.getInvoices();
        for (let invoice of invoices) {
            if (await Invoices.checkIsFetched(this.config.id, invoice.id)) continue;

            const buffer = await this.fetchInvoice(invoice);
            if (buffer) {
                await Email.send(buffer, this.config, invoice);
                await Invoices.markAsFetched(this.config.id, invoice.id);
            }
        }
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
    protected abstract getInvoices(): Promise<Array<Invoice>>

    /**
     * Fetch the invoice to a buffer.
     * @param invoice The invoice to fetch.
     */
    protected abstract fetchInvoice(invoice: Invoice): Promise<Buffer | null>;
}