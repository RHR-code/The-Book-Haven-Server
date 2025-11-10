const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
app.use(cors());
app.use(express.json());
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
    const booksCollection = bookDB.collection("books");

    // all books api
    app.get("/all-books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    // latest books api
    app.get("/latest-books", async (req, res) => {
      const result = await booksCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      console.log(result);
      res.send(result);
    });

    // const result = await .insertOne({ name: "RHR" });
    // console.log(result);

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
