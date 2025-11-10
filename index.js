const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x3egp.mongodb.net/?appName=Cluster0`;

app.get("/", (req, res) => {
  res.send("Server is running");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const bookDB = client.db("bookDB");
    const books = bookDB.collection("books");

    const result = await books.insertOne({ name: "RHR" });
    console.log(result);

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`the server is running at port ${port}`);
});
