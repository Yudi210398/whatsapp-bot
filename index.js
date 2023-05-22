import mongoose from "mongoose";
import qrcode from "qrcode-terminal";

import pkg from "whatsapp-web.js";
const { Client, RemoteAuth } = pkg;
import { MongoStore } from "wwebjs-mongo";
import { logicAbsen } from "./components/logicAbsen.js";

(async () => {
  await mongoose.connect(
    "mongodb://runatyudi:kawasanrokok1998@cluster0-shard-00-00.oaqmd.mongodb.net:27017,cluster0-shard-00-01.oaqmd.mongodb.net:27017,cluster0-shard-00-02.oaqmd.mongodb.net:27017/whatappJsBot?ssl=true&replicaSet=atlas-myi90d-shard-0&authSource=admin&retryWrites=true&w=majority",
  );

  const store = await new MongoStore({ mongoose });

  const client = await new Client({
    authStrategy: new RemoteAuth({
      store,
      backupSyncIntervalMs: 500000,
    }),
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  logicAbsen(client);

  client.initialize();
})();
