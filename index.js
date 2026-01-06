const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
var admin = require("firebase-admin");

// index.js
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);

// const serviceAccount = require("./the-book-haven-sdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middlewares
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  console.log("token is verifying");
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "You're Not Authorized" });
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log(decoded);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "You're Not Authorized" });
  }
};

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
    // await client.connect();

    const bookDB = client.db("bookDB");
    const booksCollection = bookDB.collection("books");
    const commentCollection = bookDB.collection("comment");
    // all books api
    app.get("/all-books", async (req, res) => {
      const sortVal = req.query.sort;
      const email = req.query.email;
      const searchText = req.query.searchText;
      const sort = {};
      if (sortVal) {
        sort.rating = sortVal;
      }

      const query = {};
      if (email) {
        if (email !== req.token_email) {
          return res.status(401).send({ message: "You're Not Authorized" });
        }
        query.userEmail = email;
      }
      if (searchText) {
        query.title = { $regex: searchText, $options: "i" };
      }
      const result = await booksCollection.find(query).sort(sort).toArray();
      res.send(result);
    });

    // latest books api
    app.get("/latest-books", async (req, res) => {
      const result = await booksCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();
      console.log(result);
      res.send(result);
    });
    // book details
    app.get("/book-details/:id", async (req, res) => {
      const id = req.params.id;
      const result = await booksCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });
    // add book
    app.post("/add-books", verifyFirebaseToken, async (req, res) => {
      const result = await booksCollection.insertOne(req.body);
      console.log(result);
      res.send(result);
    });

    // update book
    app.patch("/update-book/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: req.body };
      const result = await booksCollection.updateOne(query, update);
      res.send(result);
    });
    // delete book
    app.delete("/delete-book/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
      console.log(result);
    });
    // comment related api
    // add a comment
    app.post("/add-comment", async (req, res) => {
      const result = await commentCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    // get a comment
    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { bookId: id };
      const result = await commentCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`the server is running at port ${port}`);
});
