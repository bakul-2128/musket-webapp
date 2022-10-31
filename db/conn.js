const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("connection stablish");
  })
  .catch((e) => {
    console.log("not succcesful");
  });
