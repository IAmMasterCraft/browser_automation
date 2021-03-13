// cors
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());
const plateDetails = require("./engine/numberInfo");
const package = require("./engine/packageName");

app.get('/', (request, response) => {
    response.redirect('/api/plate-number/');
});

app.get("/api/plate-number/", (request, response) => {
  response.send("Hey there! Documentation never set.");
});

app.get("/api/check-package/:name", async(request, response) => {
    const packageName = await package.getPackageNameInfo(request.params.name);
    await response.status(200).json(packageName);
});

app.post("/api/plate-number/", async (request, response) => {
    const plateInfo = await plateDetails.getNumberInfo(request.body.plate_number);
    await response.status(200).send(plateInfo);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`WebServer started listening on port ${port}...`)
);