const mongoose = require("mongoose");
const reqSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  id: {
    data: Buffer,
    type: String,
  },
  designation: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const Reqfrommanager = new mongoose.model("Reqfrommanager", reqSchema);
module.exports = Reqfrommanager;
