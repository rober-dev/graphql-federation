// Vendor libs
const { ApolloServer, gql } = require('apollo-server-express');
const { buildFederatedSchema } = require('@apollo/federation');
const express = require('express');

// Load environment settings
require('dotenv').config();

// Custom reviews
const reviews = require('../data/reviews.js');
const users = require('../data/users.js');

const PORT = process.env.PORT || 4002;

// -----------------------------------------
// Schema definition
// -----------------------------------------

// TypeDefs
const typeDefs = gql`
  type Review @key(fields: "id") {
    id: ID!
    body: String
    author: User @provides(fields: "username")
    product: Product
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String! @external
    reviews: [Review]
  }

  extend type Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }
`;

// Resolvers
const resolvers = {
  Review: {
    author(review) {
      return { __typename: 'User', id: review.authorID };
    }
  },
  User: {
    username(user) {
      const found = users.find(username => username.id === user.id);
      return found ? found.username : null;
    },
    reviews(user) {
      return reviews.find(review => review.authorID === user.id);
    },
    numberOfReviews(user) {
      return reviews.filter(review => review.authorID === user.id).length;
    }
  },
  Product: {
    reviews(product) {
      return reviews.find(review => review.product.upc === product.upc);
    }
  }
};

// -----------------------------------------
// Apollo Server setup
// -----------------------------------------
const apolloServer = new ApolloServer({
  port: PORT,
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

// Add express to Apollo server
const app = express();
apolloServer.applyMiddleware({ app });

// -----------------------------------------
// Start server
// -----------------------------------------
app.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  )
);
