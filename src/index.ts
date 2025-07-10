import {API} from "./API.js";
import {Invoices, SimyoInvoice} from "./Invoices.js";
import {Email} from "./Email.js";
import {ConfigManager} from "./ConfigManager.js";

const config = await ConfigManager.get();

const phoneNumber = config.fetchers[0].phone;
const password = config.fetchers[0].password;

// Check credentials
if (!phoneNumber || !password) {
    console.error("[ERROR] Required environment variables are not set. See .example.env");
    process.exit(1);
}

// Get auth token
console.info("[INFO] Authenticating...");
const loginSuccess = await API.getAuthToken(phoneNumber, password);

// Check for login failure
if (!loginSuccess) {
    console.error("[ERROR] Failed to authenticate. Check your credentials.");
    process.exit(1);
}

// Fetch invoices
console.info("[INFO] Login successful.");
console.info("[INFO] Fetching invoices.");
await findInvoiceToDownload();
console.info("[INFO] Finished.")

/**
 * Find whether there are invoices to download.
 */
async function findInvoiceToDownload() {
    const invoices = await API.getInvoices();
    const availableInvoices = invoices.filter(e => !e.concept);
    for (let invoice of availableInvoices) {
        if (!await Invoices.checkIsFetched(invoice.invoiceNumber)) {
            // Invoice needs to be fetched.
            console.info("[INFO] Found new invoice: ", invoice.invoiceNumber);
            await fetchInvoice(invoice);
        }
    }
}

/**
 * Fetch the given invoice.
 * @param invoice The invoice
 */
async function fetchInvoice(invoice: SimyoInvoice) {
    const buffer = await API.getInvoiceBuffer(invoice.invoiceNumber);
    if (!buffer) {
        console.error("[ERROR] Invoice buffer not found. Not sending e-mail.");
        process.exit(1);
    }

    await Email.send(buffer, invoice);
    await Invoices.markAsFetched(invoice.invoiceNumber);
}