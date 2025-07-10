import { SimyoInvoice } from "./types.js";

export class SimyoAPI {
    /**
     * The auth token for the user.
     * @private
     */
    private static authToken: string | null = null;

    /**
     * Create a fetch request.
     * @param phone The phone number to log in for.
     * @param pass The password to log in with.
     * @private
     */
    public static async authenticate(phone: string, pass: string): Promise<boolean> {
        const body = JSON.stringify({
            phoneNumber: phone,
            password: pass,
            impersonatedPhoneNumber: ""
        });

        const result = await fetch("https://mijn.simyo.nl/auth/login", {
            "headers": {
                "content-type": "application/json",
            },
            "body": body,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        if (result.status !== 200) {
            console.error("[ERROR] Login failure.", result.text());
            return false;
        }

        // Retrieve authentication cookie
        const cookies = result.headers.getSetCookie();
        for (const cookieString of cookies) {
            if (!cookieString.startsWith("__Host-sessionKey=")) continue;

            const parts = cookieString.split(";");
            SimyoAPI.authToken = parts[0].split("=")[1];

            // Return whether result was successful.
            return (SimyoAPI.authToken ?? "").length > 0;
        }

        return false;
    }

    /**
     * Get the invoices from the API
     */
    public static async getInvoices(): Promise<Array<SimyoInvoice>> {
        const result = await fetch("https://mijn.simyo.nl/api/get?endpoint=listAllPostpaid", {
            "headers": {
                "cookie": `__Host-sessionKey=${SimyoAPI.authToken}`
            },
            "referrer": "https://mijn.simyo.nl/facturen",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (result.status !== 200) {
            console.error("[ERROR] Failed to fetch invoices.");
            return [];
        }

        const json = await result.json();
        return json.result;
    }

    /**
     * Download the invoice PDF.
     * @param id
     */
    public static async getInvoiceBuffer(id: string): Promise<Buffer | null> {
        const url = "https://mijn.simyo.nl/api/get"+
            `?endpoint=downloadPostpaidPdf&args=${id}`;

        const result = await fetch(url, {
            "headers": {
                "cookie": `__Host-sessionKey=${SimyoAPI.authToken}`
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (result.status !== 200) {
            console.error("[ERROR] Failed to download invoice.",
                await result.text());

            return null;
        }

        const blob = await result.blob();
        return Buffer.from(await blob.arrayBuffer());
    }
}