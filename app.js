require("dotenv").config();

const fs = require("fs");
var pdf = require("pdf-creator-node");
const qrcode = require("qrcode");
const _ = require("lodash");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const path = require("path");
const Reqfrommanager = require("./models/reqregister");
const TicketForm = require("./models/ticketForm");
const AdminForm = require("./models/adminForm");
const Register = require("./models/register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");
const multer = require("multer");

let newUser = "LOGIN/SIGNUP";

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "./public");
console.log(static_path);

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set("view engine", "ejs");

console.log(process.env.SECRET_KEY);
app.get("/", (req, res) => {
  res.render("index", { user: newUser });
});

app.get("/detailedview", (req, res) => {
  res.render("detailedview", { user: newUser });
});
app.get("/bookingform", (req, res) => {
  res.render("newuser", { user: newUser });
});
app.get("/about", (req, res) => {
  res.render("about", { user: newUser });
});
app.get("/reqregister", (req, res) => {
  res.render("reqregister", { user: newUser });
});
app.get("/contact", (req, res) => {
  res.render("contact", { user: newUser });
});

app.get("/ticket", (req, res) => {
  AdminForm.find({}, function (err, admindata) {
    res.render("ticket", {
      admindata: admindata,
      user: newUser,
    });
  });
});
app.get("/adminpanel", (req, res) => {
  AdminForm.find({}, function (err, admindata) {
    res.render("adminpanel", {
      admindata: admindata,
    });
  });
});
app.get("/userticketlist", function (req, res) {
  TicketForm.find({}, function (err, data) {
    res.render("userticketlist", {
      ticketdatalist: data,
    });
  });
});
app.get("/login", (req, res) => {
  newUser = "LOGIN/SIGNUP";
  res.render("login");
});

app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user);
    req.user.tokens = req.user.tokens.filter((currentele) => {
      return currentele.token != req.token;
    });
    res.clearCookie("jwt");

    console.log("logoyty");
    await req.user.save();
    // res.sendFile(`${static_path}/login.html`);
    res.render("login");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/newuser", auth, (req, res) => {
  // res.sendFile(`${static_path}/newuser1.html`);
  res.render("newuser1", { user: newUser });
});
//yahan pe template engin ka use karne ke liye hum get methon laga ke apni file ko send kar sakte h
//aur file ka extension bhi chupa sakte h
// app.get("/about", (req, res) => {
//   res.sendFile(`${static_path}/about.html`);
// });

//creae a new user in our databasae
app.post("/register", async (req, res) => {
  try {
    const password = req.body.pass;
    // const hpass = await bcrypt.hash(password, 10);
    //yahan ke alawa register.js file me bhi function lekar kar sakte h
    const conpassword = req.body.conpassword;
    if (password === conpassword) {
      const registeruser = new Register({
        user_id: req.body.uid,
        fullname: req.body.f_name,
        password: password,
        conpassword: password,
      });
      //registeruser registers collection ka ek instance H
      const token = await registeruser.generateAuthToken();

      //res.cookie() function is used t set the cooke name to value.
      //th value parameter may be a  string or object converted to JSON
      //Syntax: res.cookie(name, value, [options]);
      /*  res.cookie("jwt", token);
      console.log(cookie); */

      //for expire of cookie

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });
      const registered = await registeruser.save();
      // console.log(registered);
      // console.log(token);
      res.status(201);
      res.render("login", { user: newUser }); //if we use template engin so we have to render this file as this would be ejs file
    } else {
      res.send("password are not matched");
    }

    /* console.log(req.body.fullname);
    res.send(req.body.fullname); */
  } catch (err) {
    res.status(400).send(err);
  }
});

//login check

app.post("/login", async (req, res) => {
  try {
    const email = req.body.userid;
    const password = req.body.pass;

    const data = await Register.findOne({ user_id: email });
    const checkpass = await bcrypt.compare(password, data.password);
    const token = await data.generateAuthToken();
    //yaha pe data registers collection ka ek instance h isliye uske through hum
    //token generate karenge
    console.log("this is token" + token);
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 500000),
      httpOnly: true,
      //secure: true,
    });
    // console.log(` this is cookie ${req.cookies.jwt}`);

    // console.log(checkpass);
    // if (data.password == password) {
    // if(email==process.env.email1 && password==process.env.password1){
    //     res.render("adminpanel");
    // }
    // if (email == process.env.ADEMAIL && password == process.env.ADPASS) {
    //   res.redirect("/adminpanel");
    // }
    // if (email == process.env.MADEMAIL && password == process.env.MADPASS) {
    //   res.redirect("/mainadminpanel");
    // } else {
    if (checkpass) {
      res.status(201);
      newUser = "LOGOUT";
      if (email == process.env.ADEMAIL && password == process.env.ADPASS) {
        res.redirect("/adminpanel");
      } else if (
        email == process.env.MADEMAIL &&
        password == process.env.MADPASS
      ) {
        res.redirect("/mainadminpanel");
      } else {
        res.render("index", { user: newUser });
      }
    } else {
      res.send("invalid1");
    }

    // res.send(data.password);
    // console.log(data);
    //console.log(`${password}`);
  } catch (err) {
    res.status(400).send("invalid4");
  }
});
app.get("/compose", function (req, res) {
  res.render("compose");
});
///admin adding arts/musemums

app.post("/compose", function (req, res) {
  let adminformData = new AdminForm({
    title: req.body.postTitle,
    content: req.body.postBody,
    link1: req.body.link1,
    slink2: req.body.link2,
    slink3: req.body.link3,
    open: req.body.open,
    close: req.body.close,
    maplink: req.body.maplink,
  });

  // posts.push(post);
  adminformData.save();
  res.redirect("/ticket", { user: newUser });
  // console.log(posts);
});
app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title);

    if (storedTitle === requestedTitle) {
      res.render("detailedview", {
        title: post.title,
        content: post.content,
        link1: post.link1,
        slink2: post.slink2,
        slink3: post.slink3,
        open: post.open,
        close: post.close,
        maplink: post.maplink,
      });
    }
  });
});

app.post("/bookingform", function (req, res) {
  let ticketformData = new TicketForm({
    full_name: req.body.full_name,
    user_id: req.body.user_id,
    Museum: req.body.Museum,
    contact: req.body.contact,
    date: req.body.date,
    no_person: req.body.no_person,
    time: req.body.time,
  });
  ticketformData.save();

  // console.log(ticketformData);
  let stringdata = JSON.stringify(ticketformData);
  console.log(stringdata);
  qrcode.toDataURL(stringdata, (err, src) => {
    res.render("qrscan", {
      qr_code: src,
      Museum: ticketformData.Museum,
      name1: ticketformData.full_name,
    });

    // ticketformData.save();
  });
});
////////file upload///////////////
let storage = multer.diskStorage({
  destination: "./public/images",

  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
let upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, true);
      cb(new Error("invalid image format"));
    }
  },
});

app.post("/request", upload.single("vid"), async (req, res) => {
  try {
    const aanah = new Reqfrommanager({
      full_name: req.body.fullname,
      email: req.body.email,
      id: req.file.filename,
      designation: req.body.designation,
      phone: req.body.phone,
    });
    await aanah.save();
    res.render("reqregister", { user: newUser });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/mainadminpanel", (req, res) => {
  Reqfrommanager.find({}, function (err, admindata) {
    res.render("mainadminpanel", {
      admindata: admindata,
    });
  });
});
app.get("/registereduserlist", (req, res) => {
  Register.find({}, function (err, userdata) {
    res.render("registereduserlist", {
      userdata: userdata,
    });
  });
});

app.listen(port, () => {
  console.log("sever is running of ");
});
