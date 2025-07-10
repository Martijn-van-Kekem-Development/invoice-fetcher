import * as fs from "node:fs/promises";

export class Invoices {
    /**
     * The retrieved data.
     * @private
     */
    private static json: string[] | null = null;

    /**
     * Get the fetched invoices from disk.
     * @private
     */
    private static async getFetchedInvoices(force: boolean = false): Promise<string[]> {
        if (this.json === null || force) {
            const data = await fs.readFile('data/fetched_invoices.json', 'utf8');
            this.json = JSON.parse(data) as string[];
        }

        return this.json;
    }

    /**
     * Get the fetched invoices from disk.
     * @private
     */
    public static async markAsFetched(id: string): Promise<void> {
        const json = await this.getFetchedInvoices();
        json.push(id);
        await fs.writeFile('data/fetched_invoices.json', JSON.stringify(json));

        this.json = null;
    }

    /**
     * Check whether an ID was already fetched.
     * @param id The ID to check.
     */
    public static async checkIsFetched(id: string): Promise<boolean> {
        const json = await this.getFetchedInvoices();
        return json.includes(id);
    }
}

export interface SimyoInvoice {
    invoiceNumber: string,
    total: number,
    date: string,
    concept: boolean
}