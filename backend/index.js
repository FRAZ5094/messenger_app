const express = require("express");
const { postgraphile } = require("postgraphile");
const app = express();
const cors = require("cors");
const { Client } = require("pg");
require("dotenv").config();

var admin = require("firebase-admin");

var serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const client = new Client ({
  connectionString: process.env.DATABASE_URL
});

client.connect((err, client, done ) => {
  if (err){
    console.log("Error in pg connecting to database", err);
  } else {
    console.log("pg connected to Database");
    client.on('notification', (msg) => {
      console.log("PAYLOAD FROM DATABASE", msg.payload);
      let json_payload = JSON.parse(msg.payload);
      //get from database
      let fcmToken = "fdX6LCMgT0ecUrgsnJVGg5:APA91bFVwva0BwfZjxwdn4cHiFdUycSnSzY1bkjAqfbkrhlSLaDbGfPYenu2m7MMbZ0tCfyPLYB5GPFoUp237rnKNy2pe75zUfnVY7ALiww6zahUAE3g4Dohgw-Ud5z5ksaPGITskMiq"
      let senderid = json_payload.senderid;
      client.query(`SELECT name FROM message_app_users WHERE id=${senderid}`, (err, res) => {
        if (!err){
          let senderName=String(res.rows[0].name);
          let messageContents = String(json_payload.content);
          admin.messaging().sendToDevice(
            fcmToken,
            {notification: {title: senderName, body : messageContents}},
            {contentAvailable: true, priority: "high"});

        } else {
          console.log("Error getting senderName from senderid: ", err);
        }
        client.end;
      });

    });
    const query = client.query("LISTEN message_notification");
  }
});

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
