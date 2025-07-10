# Contributing

## Introduction
Invoice Fetcher (short: IF) is an application that fetches invoices from various sources, and sends these files per e-mail as attachment.

If you're reading this document, you're probably interested in contributing to this project. We very much appreciate this effort!
Please read the document outlined below carefully, to make sure your contributions are consistent with the existing code base.

## Explanation of the existing code
### Fetching matches
Invoices are fetched by a class that extends the abstract [`Fetcher`](./src/Fetchers/Fetcher.ts) class.

### Defining fetchers
The available fetchers are defined in [`the configuration`](./config.example.json).

## Setup your environment
You first need to create a fork of the [invoice-fetcher](https://github.com/Martijn-van-Kekem-Development/invoice-fetcher) repository to commit your changes to it. Methods to fork a repository can be found in the [GitHub Documentation](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

After that, clone the repository:
```sh
git clone https://github.com/Martijn-van-Kekem-Development/invoice-fetcher && cd invoice-fetcher
```

Add git remote controls:

```sh
git remote add fork https://github.com/YOUR-USERNAME/invoice-fetcher.git
git remote add upstream https://github.com/Martijn-van-Kekem-Development/invoice-fetcher.git
```

Install the required dependencies:
```sh
npm install
```

### Choose a base branch
All additions must be made with the `main` branch as base. Name your new branch as denoted in the table below.
Replace `[issue]` with the ID of the issue you're implementing/fixing.

| Type of change       | Name of branch               |
|:---------------------|:-----------------------------|
| Documentation        | `docs/[issue]-name-of-issue` |
| Bug fixes            | `bug/[issue]-name-of-issue`  |
| New features         | `feat/[issue]-name-of-issue` |


```sh
# Switch to the 'main' branch.
git switch main

# Pull the latest changes.
git pull

# Create a new branch to work on
git switch --create feat/1234-name-issue
```

## Running the scriopt
```sh
npm run start
```

## Publishing your contributions
As soon as you have completed implementing your contributions, follow the steps below.

First, make sure all test cases are passing.
```sh
npm test
```
Secondly, verify that the linter and typescript returns no errors.
```sh
npm run check
```

After that, make sure an issue exists for the contribution you're making. If that's not the case, create one 
first [here](https://github.com/Martijn-van-Kekem-Development/invoice-fetcher/issues).

Finally, create a pull request [here](https://github.com/Martijn-van-Kekem-Development/invoice-fetcher/pulls)
to merge your branch into main.

## Support
If you have any questions or problems while contributing to this project, feel free to ask a question on the 
[issue page](https://github.com/Martijn-van-Kekem-Development/invoice-fetcher/issues) for this repository.