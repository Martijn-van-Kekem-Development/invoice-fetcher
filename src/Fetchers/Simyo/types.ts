import { FetcherConfig } from "../../Helpers/ConfigManager.js";

export interface SimyoInvoice {
    invoiceNumber: string,
    total: number,
    date: string,
    concept: boolean
}

export interface SimyoFetcherConfig extends FetcherConfig {
    type: "simyo",
    phone: string,
    password: string,
}