const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cpeRoutes = require("./routes/cpeRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/cpes", cpeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


