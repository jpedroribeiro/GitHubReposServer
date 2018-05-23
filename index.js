require('dotenv').config();
const fetch = require('node-fetch');
const cors = require('cors');
const corsOptions = {
	origin: process.env.ORIGIN,
	optionsSuccessStatus: 200
};

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
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

fetch('https://api.github.com/graphql', {
	method: 'POST',
	body: JSON.stringify({ query }),
	headers: {
		Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
	}
})
	.then(res => res.json())
	.then(body => {
		express()
			.get('/', cors(corsOptions), (req, res) => res.json(body))
			.listen(PORT, () => console.log(`Listening on ${PORT}`));
	})
	.catch(error => console.error(error));
