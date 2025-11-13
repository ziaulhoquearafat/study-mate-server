const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./study-mate-firebase-adminsdk.json");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  CURSOR_FLAGS,
} = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middlewware
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri =
  "mongodb+srv://study_mate_db:YOawYATN9iOngn1P@cluster0.6prdapd.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({
      message: "unauthorized access. Token Not Found",
    });
  }
  const token = authorization.split(" ")[1];
  console.log(token);
  try {
    const decode = await admin.auth().verifyIdToken(token);
    console.log(decode);
    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access",
    });
  }
};

app.get("/", (req, res) => {
  res.send("Study Mate Server Is Running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("partner-db");
    const partnerCollection = db.collection("partner");
    const partnerRequestCollection = db.collection("partner-req");

    // GET
    app.get("/partner", async (req, res) => {
      const result = await partnerCollection.find().toArray();
      res.send(result);
    });

    app.get("/partner/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const result = await partnerCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    app.get("/partners/top-rated", async (req, res) => {
      const result = await partnerCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // POST
    app.post("/partner", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await partnerCollection.insertOne(data);
      res.send(result);
    });

    app.post("/partner-request/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const result = await partnerRequestCollection.insertOne(data);
      const filter = { _id: new ObjectId(id) };
      const update = {
        $inc: {
          partnerCount: 1,
        },
      };
      const partnerCounted = await partnerCollection.updateOne(filter, update);
      res.send(result, partnerCounted);
    });

    app.get("/partner-request", verifyToken, async (req, res) => {
      const email = req.query.userEmail;
      const result = await partnerRequestCollection
        .find({ requestEmail: email })
        .toArray();
      res.send(result);
    });

    app.delete("/partner-request/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await partnerRequestCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.put("/partner-request/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("updating", data);
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await partnerRequestCollection.updateOne(filter, update);
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      const search_text = req.query.search || "";
      const sortOrder = req.query.sort || "";

      const query = {
        subject: { $regex: search_text, $options: "i" },
      };

      let cursor = partnerCollection.find(query);
      if (sortOrder === "asc") {
        cursor = cursor.sort({ experienceLevel: -1 });
      } else if (sortOrder === "desc") {
        cursor = cursor.sort({ experienceLevel: 1 });
      }

      const result = await cursor.toArray();
      res.send(result);
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
