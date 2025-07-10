import { ConfigManager, FetcherConfig } from "./Helpers/ConfigManager.js";
import { Invoices } from "./Helpers/Invoices.js";
import { Fetcher } from "./Fetchers/Fetcher.js";
import { SimyoFetcher } from "./Fetchers/Simyo/SimyoFetcher.js";
import { OVHFetcher } from "./Fetchers/OVH/OVHFetcher.js";
import { OVHFetcherConfig } from "./Fetchers/OVH/types.js";
import { SimyoFetcherConfig } from "./Fetchers/Simyo/types.js";

// Retrieve user config
const config = await ConfigManager.get();

// Run all supplied fetchers
for (const fetcher of config.fetchers) {
    const fetcherClass = createFetcher(fetcher);

    // Invalid fetcher check
    if (!fetcherClass) {
        console.error("Invalid fetcher type specified", fetcher.id);
        continue;
    }

    // Execute
    await fetcherClass.execute();
}

/**
 * Create a new fetcher class by the supplied id.
 * @param config The fetcher configuration
 */
function createFetcher(config: FetcherConfig): Fetcher | null {
    if (config.type === "simyo")
        return new SimyoFetcher(config as SimyoFetcherConfig);
    if (config.type === "ovh")
        return new OVHFetcher(config as OVHFetcherConfig);

    return null;
}

// Save sent invoices to disk.
await Invoices.saveToDisk();