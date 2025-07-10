import { OVHFetcherConfig, OVHInvoice } from "./types.js";
import { createHash } from "node:crypto";

export class OVHAPI {
    /**
     * Get the time delta from the OVH servers.
     * @param config
     */
    public static async getTimeDelta(config: OVHFetcherConfig): Promise<number> {
        const result = await fetch(`${config.url}/auth/time`);
        const response = await result.text();
        return Number(response) - Date.now();
    }

    /**
     * Create a fetch request.
     * @param config The configuration for the OVH fetcher.
     * @param method The request method
     * @param url The request URL
     * @param body The request body
     * @private
     */
    public static async getAuthHeaders(config: OVHFetcherConfig,
                                       method: string,
                                       url: string,
                                       body: string): Promise<Headers> {
        const headers = new Headers();
        headers.set("X-Ovh-Application", config.app_key);
        headers.set("X-Ovh-Consumer", config.consumer_key);

        // Calculate time delta
        const delta = await OVHAPI.getTimeDelta(config);
        const now = Date.now() + delta;
        headers.set("X-Ovh-Timestamp", `${now}`);

        // Calculate signature
        const toSign = `${config.app_secret}+${
            config.consumer_key}+${method}+${url}+${body}+${now}`;
        const signature = createHash("sha-1").update(toSign).digest("hex");
        headers.set("X-Ovh-Signature", `$1$${signature}`);

        return headers;
    }

    /**
     * Get the invoices from OVH
     * @param config
     */
    public static async getInvoicesIDs(
        config: OVHFetcherConfig): Promise<string[] | null> {

        const url = `${config.url}/me/bill`;
        const result = await fetch(url, {
            headers: await this.getAuthHeaders(config, "GET", url, ""),
        });

        if (result.status !== 200) {
            return null;
        }

        return await result.json() as string[];
    }

    /**
     * Fetch the invoice from OVH
     * @param id The invoice ID to fetch
     * @param config
     */
    public static async fetchInvoice(
        id: string, config: OVHFetcherConfig): Promise<OVHInvoice | null> {

        const url = `${config.url}/me/bill/${id}`;
        const result = await fetch(url, {
            headers: await this.getAuthHeaders(config, "GET", url, ""),
        });

        if (result.status !== 200) {
            return null;
        }

        return await result.json() as OVHInvoice;
    }

    /**
     * Get the invoice content
     * @param url The url fetch the content from
     * @private
     */
    public static async getInvoiceContent(url: string): Promise<Buffer | null> {
        const result = await fetch(url);
        const blob = await result.blob();
        return Buffer.from(await blob.arrayBuffer());
    }
}