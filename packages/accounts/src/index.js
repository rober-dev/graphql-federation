// Vendor libs
const { ApolloServer, gql } = require('apollo-server-express');
const { buildFederatedSchema } = require('@apollo/federation');
const express = require('express');

// Load environment settings
require('dotenv').config();

// Custom users
const users = require('../data/users.js');

const PORT = process.env.PORT || 4001;

// -----------------------------------------
// Schema definition
// -----------------------------------------

// TypeDefs
const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
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
