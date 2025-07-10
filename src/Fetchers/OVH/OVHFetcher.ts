import { Fetcher } from "../Fetcher.js";
import { Invoice } from "../Invoice.js";
import { OVHFetcherConfig } from "./types.js";
import { OVHAPI } from "./OVHAPI.js";

export class OVHFetcher extends Fetcher {
    /**
     * The configuration for this fetcher.
     * @protected
     */
    protected config: OVHFetcherConfig;

    /**
     * Constructor for Fetcher.
     * @param config The supplied configuration.
     */
    constructor(config: OVHFetcherConfig) {
        super(config);
        this.config = config;
    }

    /**
     * @override
     */
    protected async validate(): Promise<boolean> {
        return (this.config.consumer_key ?? "").length > 0 &&
            (this.config.app_key ?? "").length > 0 &&
            (this.config.app_secret ?? "").length > 0 &&
            (this.config.url ?? "").length > 0;
    }

    /**
     * @override
     */
    public async getInvoiceIDs(): Promise<string[]> {
        const result = await OVHAPI.getInvoicesIDs(this.config);
        if (!result) {
            this.log("error", "Couldn't retrieve invoices. Exiting...");
            return [];
        }

        return result;
    }

    /**
     * @override
     */
    public async fetchInvoice(id: string): Promise<Invoice | null> {
        const invoice = await OVHAPI.fetchInvoice(id, this.config);
        if (!invoice) {
            this.log("error", `Couldn't fetch invoice ${id}. Skipping.`);
            return null;
        }

        const content = await OVHAPI.getInvoiceContent(invoice.pdfUrl);
        if (!content) {
            this.log("error", `Couldn't retrieve invoice data for ${id}. SKipping.`);
            return null;
        }

        return {
            id: invoice.billId,
            total: invoice.priceWithTax.value,
            date: new Date(invoice.date),
            content: content,
        } as Invoice;
    }
}