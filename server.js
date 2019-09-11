const express = require("express");
const app = express();
const path = require("path");

// Define path for express config
const staticPath = path.join(__dirname, "/public");

// Setup static directory to serve
app.use(express.static(staticPath));

//Start server at PORT 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
