// Vendor libs
const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloGateway } = require('@apollo/gateway');
const express = require('express');

// Load environment settings
require('dotenv').config();

const PORT = process.env.PORT || 5001;
const { API_ACCOUNTS, API_PRODUCTS, API_REVIEWS, API_INVENTORY } = process.env;

// -----------------------------------------
// Apollo Gateway
// -----------------------------------------
const apolloGateway = new ApolloGateway({
  port: PORT,
  serviceList: [
    { name: 'accounts', url: API_ACCOUNTS },
    { name: 'products', url: API_PRODUCTS },
    { name: 'reviews', url: API_REVIEWS },
    { name: 'inventory', url: API_INVENTORY }
  ]
});

// -----------------------------------------
// Apollo Server setup
// -----------------------------------------
(async () => {
  // Load APIs
  const { schema, executor } = await apolloGateway.load();

  // Setup Apollo Server
  const apolloServer = new ApolloServer({ schema, executor });
  const app = express();
  apolloServer.applyMiddleware({ app });

  // Start server
  app.listen({ port: PORT }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    )
  );
})();
