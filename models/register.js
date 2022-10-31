const { MongoTopologyClosedError } = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  conpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//ye middle wareh jo user ke data enter karne ke bad aur usko database me save karne se phele
//execute hoga
userSchema.methods.generateAuthToken = async function () {
  try {
    //console.log(this._id);
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    this.tokens = this.tokens.concat({ token: token });
    //console.log(token);
    await this.save();
    return token;
  } catch (err) {
    res.send("the error is " + err);
    // console.log("this is error" + err);
  }
};

//ye method database me save hone se phele run hogi that is whay pre
userSchema.pre("save", async function (next) {
  //jab koi password ka field ko upadate karega pheli bar ya update karega
  if (this.isModified("password")) {
    //const hpass = await bcrypt.hash(password, 10);
    console.log(`${this.password}`);
    this.password = await bcrypt.hash(this.password, 10); // password user ne dala h
    //usi ko vaps hash kar ke bhed diya uper wale me alag variable bhejna padta
    console.log(`${this.password}`);
    //this.conpassword = undefined;//conirmed database me store nahi hoga
  }

  next();
});

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
