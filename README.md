# GitHub Repositories Server

This is a very simple ExpressJS server that connects to GitHub's GraphQL API and outputs its data.

This approach was mostly used to obfuscate auth keys for the client side app (currently under construction).

# Usage

Create a `.env` file with the following:

    GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN
    GITHUB_PROFILE=USER

Replacing `YOUR_TOKEN` with a token you got via your [GitHub Developer Settings](https://github.com/settings/tokens) and `USER` with any GitHub username, like mine `jpedroribeiro`.

### Note to self: when using Heroku...

I was using Heroku to host this app, so I've made this note as I always forgot to push my changes to their repo:

    git add .
    git commit -m "..."
    git push origin master
    git push heroku master
