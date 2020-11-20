# Contributing Guide
We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Set Up Environment

1. Create a Discord server and [Discord Application](https://discord.com/developers/applications) then add a bot.
2. Install Discord bot onto Discord server by going to `https://discordapp.com/oauth2/authorize?client_id=<CLIENT_ID>&scope=bot`.
3. Copy `.env.example` to `.env` and fill in the variables.

    - `DISCORD_BOT_TOKEN` - from step 1
    - `GITHUB_TOKEN` - create [here](https://github.com/settings/tokens) with `public_repo` scope
    - `DEBUG_CHANNEL` - always cc messages to this channel

4. Run `npm install`.

### Development

5. Open two terminals, and run:

    1. `npm run dev` - _Starts the development server_
    1. `npm run smee` - _Starts the smee server which proxies GitHub webhook events to development server_

6. Go to a test GitHub repository and create a webhook with the smee url, select `Content type: application/json` and check only the `project_card` event.
7. Retrieve channel id by sending `!github-project debug` to `GitHub Project Notifier` bot you installed in step 2, update `DEBUG_CHANNEL` in `.env`, and restart `npm run dev`.

### Production

5. `npm start` - _Starts the production server. Alternatively, you can use `pm2`_
6. Set up a proxy to 5. with domain and SSL.
7. Create a [GitHub App](https://github.com/settings/apps) with `Project card` webhook, and configure 6. as the webhook url.

## We Use [GitHub Flow](https://guides.GitHub.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests
Pull requests are the best way to propose changes to the codebase (we use [GitHub Flow](https://guides.GitHub.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `master`.
1. If you've added code that should be tested, add tests.
1. If you've changed APIs, update the documentation.
1. Ensure the test suite passes.
1. Make sure your code lints.
1. Create that pull request!

## Commit Message and Pull Request Title

Commit message and pull request title should follow [Conventional Commits](https://www.conventionalcommits.org).

An easy way to achieve that is to install [`commitizen`](https://github.com/commitizen/cz-cli) and run `git cz` when committing.

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
