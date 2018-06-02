// Load up environment variables (check README.md for more details)
require('dotenv').config();

// Import fetch polyfil for node
const fetch = require('node-fetch');

// Our GraphQL query for GitHub's API
const query = `
	query {
		user(login: "${process.env.GITHUB_PROFILE}") {
			name
			url
			bio
			avatarUrl
			location
			repositories (privacy: PUBLIC, first: 100, orderBy: {field: CREATED_AT, direction: DESC} ){
				nodes (){
					id
					name
					createdAt
					description
					url
					primaryLanguage (){
						name
					}
					pushedAt
					repositoryTopics (first: 100){
						nodes{
							topic {
								name
							}
						}
					}
				}
			}
		}
	}`;

// Fetching data through GitHub's API
fetch('https://api.github.com/graphql', {
	method: 'POST',
	body: JSON.stringify({ query }),
	headers: {
		Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
	}
})
	.then(res => res.json())
	.then(body => {
		// Import dependencies
		const express = require('express');
		const bodyParser = require('body-parser');
		const { makeExecutableSchema } = require('graphql-tools');
		const {
			graphqlExpress,
			graphiqlExpress
		} = require('apollo-server-express');

		// Import and set CORS config for our own server
		const cors = require('cors');
		const corsOptions = {
			origin: process.env.ORIGIN,
			optionsSuccessStatus: 200
		};

		// Which port we're listening to
		const PORT = process.env.PORT || 5000;

		// Copying data from GitHub's API to variables
		// 1/2) Author data
		const author = {
			name: body.data.user.name,
			url: body.data.user.url,
			bio: body.data.user.bio,
			avatarUrl: body.data.user.avatarUrl,
			location: body.data.user.location
		};

		// 2/2) Repositories data
		const repositories = [];
		body.data.user.repositories.nodes.forEach(element => {
			function reduceTopicsObjectsToAnArray(nodes) {
				let topicsArray = [];
				nodes.forEach(node => {
					topicsArray.push(node.topic.name);
				});

				return topicsArray;
			}
			const repo = {
				...element,
				primaryLanguage: element.primaryLanguage
					? element.primaryLanguage.name
					: '',
				repositoryTopics: reduceTopicsObjectsToAnArray(
					element.repositoryTopics.nodes
				)
			};
			repositories.push(repo);
		});

		// Our own GraphQL type definition
		const typeDefs = `
    type Author {
      name: String
      url: String
      bio: String
      avatarUrl: String
      location: String
    }

    type Repository {
      id: String
      name: String
      createdAt: String
      description: String
      url: String
      pushedAt: String
      primaryLanguage: String
      topics: [Topic]
    }

    type Topic {
      name: String
    }

    type Query {
      author: Author
      repository(id: String): Repository
      repositories(filter: String, orderBy: String): [Repository]
    }
  `;

		// Our own GraphQL resolvers
		const resolvers = {
			Query: {
				author: () => author,
				repository: (root, search) =>
					repositories.filter(repo => repo.id == search.id)[0],
				repositories: (obj, args, ctx, info) => {
					let returnedRepos = repositories;
					if (Object.getOwnPropertyNames(args).length) {
						if (args.filter) {
							// Filtering
							returnedRepos = returnedRepos.filter(
								repo =>
									repo.repositoryTopics.find(
										topic => topic.indexOf(args.filter) > -1
									) !== undefined
							);
						}

						if (args.orderBy && args.orderBy === 'createdAt_ASC') {
							returnedRepos = returnedRepos.sort((a, b) => {
								const aDate = new Date(a.createdAt);
								const bDate = new Date(b.createdAt);

								return aDate < bDate ? -1 : 1;
							});
						}
					}

					return returnedRepos;
				}
			},
			Repository: {
				topics: repository => {
					let topics = [];
					repository.repositoryTopics.forEach(topic => {
						topics.push(topic);
					});
					return topics;
				}
			},
			Topic: {
				name: name => name
			}
		};

		// Mix it up into a GraphQL schema
		const schema = makeExecutableSchema({
			typeDefs,
			resolvers
		});

		// Build up the server for our GraphQL endpoint
		express()
			.use(cors(corsOptions))
			// The GraphQL endpoint
			.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
			// GraphiQL, a visual editor for queries
			.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
			.listen(PORT, () => console.log('server running'));
	})
	.catch(error => console.error(error));
