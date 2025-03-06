import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import serveStatic from "serve-static";
import db from "./db/db.js";
import AuthBranchRoute from "./routes/BranchAuth.js";
import GetRoutes from "./routes/GetRoute.js";
import RequestsRoute from "./routes/RequestsRoute.js";
import AuthUserRoute from "./routes/UserAuth.js";

const STATIC_PATH =
    process.env.NODE_ENV === "production"
        ? `${process.cwd()}/frontend/dist`
        : `${process.cwd()}/frontend/`;

dotenv.config();

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

db.getConnection((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to the MySQL database!');
});

app.get("/", (req, res) => {
    res.send("local backend!");
});

app.use("/auth", AuthBranchRoute);
app.use("/auth", AuthUserRoute);
app.use("/", RequestsRoute);
app.use("/", GetRoutes);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.listen(PORT, () => {
    console.log(`Native app listening on port ${PORT}`);
});