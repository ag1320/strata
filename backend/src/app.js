//npm install express pg knex morgan cors axios xml2js helmet cookie-parser jsonwebtoken bcryptjs express-rate-limit
require("dotenv").config({ path: "../.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const bggRoutes = require("./routes/bggRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const groupsRoutes = require("./routes/groupsRoutes");
const playersRoutes = require("./routes/playersRoutes");
const sessionsRoutes = require("./routes/sessionsRoutes");
const { requireAuth } = require("./middleware/auth");

// Fail closed, not open: if the app were ever started without these set,
// the alternative is either crashing inside a request (AUTH_PASSWORD_HASH
// missing -> bcrypt throws) or, worse, someone forgetting to set
// JWT_SECRET and a hardcoded/empty fallback silently making every token
// forgeable. Refuse to boot instead.
const REQUIRED_ENV = ["AUTH_USERNAME", "AUTH_PASSWORD_HASH", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "See AUTH.md for setup (run `npm run hash-password` in backend/ to generate AUTH_PASSWORD_HASH)."
  );
  process.exit(1);
}

const app = express();

// Behind Caddy (or any reverse proxy) once deployed - needed so req.ip
// (rate limiting) and req.secure reflect the real client/connection
// instead of the proxy hop. Harmless locally.
app.set("trust proxy", 1);

// crossOriginResourcePolicy defaults to "same-origin", which would make
// Chrome block the frontend's cross-origin fetches even with CORS headers
// present - frontend (localhost:4010) and backend (localhost:4011) are
// different origins by design, same as Segla's setup.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Locked to known frontend origins - was `origin: "*"`, which can't be
// combined with credentials:true anyway (browsers reject that combo), and
// wildcard CORS on an API that now sits behind a login is exactly the kind
// of thing worth being deliberate about. CORS_ORIGIN in .env is a
// comma-separated list; default covers local dev only.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:4010")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // `origin` is undefined for same-origin/non-browser requests (curl,
      // server-to-server health checks) - allow those through.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET, PUT, POST, PATCH, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use((req, res, next) => {
  req.headers["content-length"] &&
    console.log(
      `Incoming request body size: ${req.headers["content-length"]} bytes`
    );
  next();
});

app.use(authRoutes);

app.use(requireAuth);
app.use(bggRoutes);
app.use(gamesRoutes);
app.use(groupsRoutes);
app.use(playersRoutes);
app.use(sessionsRoutes);

const port = process.env.PORT || 4011;
app.listen(port, () =>
  console.log(`Backend listening at http://localhost:${port}`)
);
