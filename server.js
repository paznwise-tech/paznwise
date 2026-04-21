const express = require("express");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
    res.send("Server running...");
});

app.listen(5000, () => console.log("Server started on port http://localhost:5000"));