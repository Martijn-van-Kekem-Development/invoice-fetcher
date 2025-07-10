import { FetcherConfig } from "../../Helpers/ConfigManager.js";

export interface OVHInvoice {
    billId: string,
    date: string,
    pdfUrl: string,
    priceWithTax: {
        value: number,
    }
}

export interface OVHFetcherConfig extends FetcherConfig {
    type: "ovh",
    url: string,
    app_key: string,
    app_secret: string,
    consumer_key: string
}