import * as fs from "node:fs/promises";

export class Invoices {
    /**
     * The retrieved data.
     * @private
     */
    private static json: Record<string, string[]> | null = null;

    /**
     * Get the fetched invoices from disk.
     * @param fetcherID The fetcher ID.
     * @param force Whether to force-pull the invoices from disk.
     * @private
     */
    private static async getFetchedInvoices(
        fetcherID: string, force: boolean = false): Promise<string[]> {

        if (this.json === null || force) {
            const data = await fs.readFile("data/fetched_invoices.json", "utf8");
            this.json = JSON.parse(data) as Record<string, string[]>;
        }

        if (!Object.keys(this.json).includes(fetcherID)) {
            this.json[fetcherID] = [];
        }

        return this.json[fetcherID];
    }

    /**
     * Save changes to the array to the disk.
     */
    public static async saveToDisk() {
        if (this.json === null) return;
        await fs.writeFile("data/fetched_invoices.json", JSON.stringify(this.json));
        this.json = null;
    }

    /**
     * Get the fetched invoices from disk.
     * @param fetcherID The fetcher ID.
     * @param id The ID to mark as fetched.
     * @private
     */
    public static async markAsFetched(fetcherID: string, id: string): Promise<void> {
        const json = await this.getFetchedInvoices(fetcherID);
        json.push(id);
    }

    /**
     * Check whether an ID was already fetched.
     * @param fetcherID The fetcher ID.
     * @param id The ID to check.
     */
    public static async checkIsFetched(
        fetcherID: string, id: string): Promise<boolean> {

        const json = await this.getFetchedInvoices(fetcherID);
        return json.includes(id);
    }
}