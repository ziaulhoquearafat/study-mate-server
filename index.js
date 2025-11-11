const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middlewware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://study_mate_db:YOawYATN9iOngn1P@cluster0.6prdapd.mongodb.net/?appName=Cluster0";

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
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Study Mate Server Is Running");
});

app.listen(port, () => {
  console.log(`Study Mate Server Is Running On Port: ${port}`);
});
