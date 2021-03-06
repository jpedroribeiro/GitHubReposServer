# GitHub Repositories Server

This is a very simple ExpressJS server that connects to GitHub's GraphQL API and outputs its data via its own GraphQL server.

This approach was mostly used to obfuscate auth keys for the [client side app](https://github.com/jpedroribeiro/GitHubReposClient). It's not an ideal solution for production but good enough for playing around with the technologies.

# Usage

Create a `.env` file with the following:

    GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN
    GITHUB_PROFILE=USER
    ORIGIN=YOUR_CLIENT_ORIGIN

Replacing `YOUR_TOKEN` with a token you got via your [GitHub Developer Settings](https://github.com/settings/tokens), `USER` with any GitHub username, like mine `jpedroribeiro`, and `ORIGIN` for your cient's origin, for example `http://localhost:3000`.

Then:

    $ node index.js

Go to `http://localhost:3000/graphiql` for GraphiQL explorer, or `http://localhost:3000/graphql` for its endpoint.

### Note to self: when using Heroku...

I was using Heroku to host this app, so I've made this note as I always forgot to push my changes to their repo:

    git add .
    git commit -m "..."
    git push origin master
    git push heroku master
