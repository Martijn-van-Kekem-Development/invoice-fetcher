import {Fetcher} from "../Fetcher.js";
import {Invoice} from "../Invoice.js";
import {SimyoFetcherConfig} from "../../Helpers/ConfigManager.js";
import {SimyoAPI} from "./SimyoAPI.js";

export class SimyoFetcher extends Fetcher {
    /**
     * The configuration for this fetcher.
     * @protected
     */
    protected config: SimyoFetcherConfig;

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
            (this.config.password ?? "").length > 0
    }

    /**
     * @override
     */
    public async getInvoices(): Promise<Array<Invoice>> {
        if (!await this.authenticate()) return [];

        const invoices = await SimyoAPI.getInvoices();
        const availableInvoices = invoices.filter(e => !e.concept);

        return availableInvoices.map(item => ({
            id: item.invoiceNumber,
            total: item.total,
            date: new Date(item.date),
        } as Invoice));
    }

    /**
     * @override
     */
    public async fetchInvoice(invoice: Invoice): Promise<Buffer | null> {
        const result = await SimyoAPI.getInvoiceBuffer(invoice.id);
        if (!result) {
            this.log("error", `Couldn't fetch invoice ${invoice.id}. Skipping.`);
            return null;
        }

        return result;
    }

    /**
     * Get the authentication token
     * @private
     */
    private async authenticate(): Promise<boolean> {
        const result = await SimyoAPI.authenticate(this.config.phone, this.config.password);
        if (!result) {
            this.log("error", "Authentication failed. Stopping this fetcher.");
        }

        return result;
    }
}