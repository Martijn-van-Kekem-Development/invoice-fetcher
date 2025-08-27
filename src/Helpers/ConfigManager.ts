import { TransportOptions } from "nodemailer";
import * as fs from "node:fs/promises";

export class ConfigManager {
    /**
     * The configuration
     * @private
     */
    private static config: Config;

    /**
     * Get the config
     * @param force Whether to force retrieve the configuration from the FS.
     */
    private static async getConfig(force: boolean = false): Promise<Config> {
        if (!this.config || force) {
            const data = await fs.readFile("config.json", { encoding: "utf8" });
            this.config = JSON.parse(data);
        }

        return this.config;
    }

    /**
     * Get the configuration.
     */
    public static async get() {
        return await this.getConfig();
    }
}

export interface Config {
    email: EmailConfig,
    fetchers: Array<FetcherConfig>
}

export interface EmailConfig {
    invoice_email: string,
    failure_email: string,
    from: string,
    smtp: TransportOptions
}

export interface FetcherConfig {
    id: string,
    type: string,
    friendly: string
}