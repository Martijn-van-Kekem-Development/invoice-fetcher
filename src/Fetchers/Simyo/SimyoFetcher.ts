import { Fetcher } from "../Fetcher.js";
import { Invoice } from "../Invoice.js";
import { SimyoAPI } from "./SimyoAPI.js";
import { SimyoFetcherConfig, SimyoInvoice } from "./types.js";

export class SimyoFetcher extends Fetcher {
    /**
     * The configuration for this fetcher.
     * @protected
     */
    protected config: SimyoFetcherConfig;

    /**
     * The fetched invoices.
     * @private
     */
    private invoices: Map<string, SimyoInvoice> = new Map<string, SimyoInvoice>();

    /**
     * Constructor for Fetcher.
     * @param config The supplied configuration.
     */
    constructor(config: SimyoFetcherConfig) {
        super(config);
        this.config = config;
    }

    /**
     * @override
     */
    protected async validate(): Promise<boolean> {
        return (this.config.phone ?? "").length > 0 &&
            (this.config.password ?? "").length > 0;
    }

    /**
     * @override
     */
    public async getInvoiceIDs(): Promise<string[]> {
        if (!await this.authenticate()) return [];

        const invoices = await SimyoAPI.getInvoices();
        if (!invoices) {
            this.log("error", "Couldn't retrieve invoices. Exiting...");
            return [];
        }

        for (const invoice of invoices) {
            if (invoice.concept) continue;
            this.invoices.set(invoice.invoiceNumber, invoice);
        }

        // Return array of ID's
        return Array.from(this.invoices.keys());
    }

    /**
     * @override
     */
    public async fetchInvoice(id: string): Promise<Invoice | null> {
        if (!this.invoices.has(id)) return null;

        const result = await SimyoAPI.getInvoiceBuffer(id);
        if (!result) {
            this.log("error", `Couldn't fetch invoice ${id}. Skipping.`);
            return null;
        }

        return {
            id: this.invoices.get(id)!.invoiceNumber,
            total: this.invoices.get(id)!.total,
            date: new Date(this.invoices.get(id)!.date),
            content: result,
        } as Invoice;
    }

    /**
     * Get the authentication token
     * @private
     */
    private async authenticate(): Promise<boolean> {
        const result =
            await SimyoAPI.authenticate(this.config.phone, this.config.password);
        if (!result) {
            this.log("error", "Authentication failed. Stopping this fetcher.");
        }

        return result;
    }
}