// Vendor libs
const { ApolloServer, gql } = require('apollo-server-express');
const { buildFederatedSchema } = require('@apollo/federation');
const express = require('express');

// Load environment settings
require('dotenv').config();

// Custom products
const products = require('../data/products.js');

const PORT = process.env.PORT || 4002;

// -----------------------------------------
// Schema definition
// -----------------------------------------

// TypeDefs
const typeDefs = gql`
  extend type Query {
    topProducts(first: Int = 5): [Product]
  }

  type Product @key(fields: "upc") {
    upc: String!
    name: String!
    price: Int
  }
`;

// Resolvers
const resolvers = {
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first);
    }
  },
  Product: {
    __resolveReference(object) {
      return products.find(product => product.upc === object.upc);
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
