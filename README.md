# Invoice Fetcher
This script automatically fetches the requested invoices from various sources, and e-mails them to you.

## Getting started
1. Clone the repository.
2. Copy `config.example.json` to `config.json` and fill the required fields.
3. Install the dependencies with `npm install`.
4. Run the script with `npm run start`.

### First run
In the first run, you will probably retrieve a lot of unwanted invoices because the script doesn't know yet which of them you have already retrieved.
We recommend running `npm run start -- --dry-run` for the first time. This will mark all currently available invoices as 'e-mailed'.

## How does this work?
The script automatically fetches all invoices that are supplied in the `settings.json` file.
When an invoice ID is found that hasn't been sent yet by e-mail, it will do so.

## Contributing
To get more information about contributing to this project, please check [CONTRIBUTING](./CONTRIBUTING.md).

## Support
If you appreciate the work I've done on this project and want to buy me a coffee, you can [click here](https://buymeacoffee.com/martijnvankekem).
