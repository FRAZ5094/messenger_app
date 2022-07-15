const express = require("express");
const { postgraphile } = require("postgraphile");
const app = express();
const cors = require("cors");
require("dotenv").config();

const postgraphileOptions = {
  subscriptions: true,
  watchPg: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  ignoreIndexes: false,
  appendPlugins: [
    require("@graphile-contrib/pg-simplify-inflector"),
    require("@graphile-contrib/pg-non-null"),
  ],
  handleErrors: (error) => console.log(error),
  exportGqlSchemaPath: "schema.graphql",
  graphiql: true,
  enhanceGraphiql: true,
  allowExplain(req) {
    // TODO: customise condition!
    return true;
  },
  enableQueryBatching: true,
  legacyRelations: "omit",
  pgSettings(req) {
    /* TODO */
  },
};

app.use(cors());
app.use(postgraphile(process.env.DATABASE_URL, postgraphileOptions));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Running on http://www.localhost:${port}/graphiql`));
