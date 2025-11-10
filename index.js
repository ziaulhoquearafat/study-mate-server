const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// middlewware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Study Mate Server Is Running");
});

app.listen(port, () => {
  console.log(`Study Mate Server Is Running On Port: ${port}`);
});
