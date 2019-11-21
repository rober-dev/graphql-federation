// Vendor libs
const { ApolloServer, gql } = require('apollo-server-express');
const { buildFederatedSchema } = require('@apollo/federation');
const express = require('express');

// Load environment settings
require('dotenv').config();

// Custom inventory
const inventory = require('../data/inventory.js');

const PORT = process.env.PORT || 4004;

// -----------------------------------------
// Schema definition
// -----------------------------------------

// TypeDefs
const typeDefs = gql`
  extend type Product @key(fields: "upc") {
    upc: String! @external
    weight: Int @external
    price: Int @external
    inStock: Boolean
    shippingEstimate: Int @requires(fields: "price weight")
  }
`;

// Resolvers
const resolvers = {
  Product: {
    __resolveReference(object) {
      return {
        ...object,
        ...inventory.find(item => item.upc === object.upc)
      };
    },
    shippingEstimate(object) {
      // Free for expensive items
      if (object.price > 1000) {
        return 0;
      }
      // Estimate shipping price based on weight
      return object.weight * 0.5;
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
