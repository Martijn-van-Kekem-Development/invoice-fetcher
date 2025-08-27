import { SimyoInvoice } from "./types.js";

export class SimyoAPI {
    /**
     * The auth token for the user.
     * @private
     */
    private static authCookies: Map<String, String> = new Map<String, String>();

    /**
     * Get the cookie string for the requests.
     * @private
     */
    private static getCookieString(): string {
        return Array.from(SimyoAPI.authCookies.entries())
            .map(([key, val]) => `${key}=${val}`).join(";");
    }

    /**
     * Update the cookies for the last request.
     * @param result
     * @private
     */
    private static updateCookies(result: Response) {
        // Retrieve authentication cookie
        const cookies = result.headers.getSetCookie();
        for (const cookieString of cookies) {
            const keyValuePart = cookieString.split(";")[0].split("=");
            SimyoAPI.authCookies.set(keyValuePart[0], keyValuePart[1]);
        }
    }

    /**
     * Request a new session, required before authenticating.
     */
    private static async requestSession() {
        const result = await fetch("https://mijn.simyo.nl/api/get?endpoint=getUsPs", {
            "headers": {
                "content-type": "application/json",
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        this.updateCookies(result);
    }

    /**
     * Create a fetch request.
     * @param phone The phone number to log in for.
     * @param pass The password to log in with.
     * @private
     */
    public static async authenticate(phone: string, pass: string): Promise<boolean> {
        await this.requestSession();

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

        this.updateCookies(result);
        return true;
    }

    /**
     * Get the invoices from the API
     */
    public static async getInvoices(): Promise<SimyoInvoice[] | null> {
        const result = await fetch("https://mijn.simyo.nl/api/get?endpoint=listAllPostpaid", {
            "headers": {
                "cookie": this.getCookieString()
            },
            "referrer": "https://mijn.simyo.nl/facturen",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (result.status !== 200) {
            console.log("getInvoices() error", await result.json());
            return null;
        }

        this.updateCookies(result);
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
                "cookie": this.getCookieString()
            },
            "body": null,
            "referrer": "https://mijn.simyo.nl/facturen",
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (result.status !== 200) {
            console.log("getInvoiceBuffer() error", await result.json());
            return null;
        }

        this.updateCookies(result);
        const blob = await result.blob();
        return Buffer.from(await blob.arrayBuffer());
    }
}