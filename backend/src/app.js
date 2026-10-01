//npm install express pg knex morgan cors axios xml2js
require("dotenv").config({ path: "../.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const bggRoutes = require("./routes/bggRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const groupsRoutes = require("./routes/groupsRoutes");
const playersRoutes = require("./routes/playersRoutes");
const sessionsRoutes = require("./routes/sessionsRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, PATCH, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  req.headers["content-length"] &&
    console.log(
      `Incoming request body size: ${req.headers["content-length"]} bytes`
    );
  next();
});

app.use(bggRoutes);
app.use(gamesRoutes);
app.use(groupsRoutes);
app.use(playersRoutes);
app.use(sessionsRoutes);

const port = 3001;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`)
);
