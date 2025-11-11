const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

app.get("/", (req, res) => {
  res.send("Study Mate Server Is Running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("partner-db");
    const partnerCollection = db.collection("partner");

    app.get("/partner", async (req, res) => {
      const result = await partnerCollection.find().toArray();
      res.send(result);
    });

    app.get("/partner/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const result = await partnerCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Study Mate Server Is Running On Port: ${port}`);
});
