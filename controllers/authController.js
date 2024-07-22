const bcrypt = require("bcryptjs");
const { User, UserService, ClientPaye } = require("../model/User");
const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const session = require("express-session");
const { decode } = require("jsonwebtoken");
const { findUseById, saveUser, getUsers } = require("../model/saveUser");
const { savePaye } = require("../model/saveUpgrade");

/**
 *
 * @param {*} req
 * @param {*} res
 */

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { username, email, password, role } = req.body;

  // let user = await User.findOne({ email });
  let users = findUseById(email);
  if (users) {
    return res.status(409).send("That email is already registered.");
  }

  //+ salt a password ou Argon2id
  const salt = await bcrypt.genSalt();
  const hashPwd = await bcrypt.hash(password, salt);

  // user = new User({
  //   username,
  //   email,
  //   password: hashPwd,
  //   role: role || "user",
  // });

  saveUser({ username, email, password: hashPwd, role: "user" });
  // await user.save();
  res.redirect("/login");
};

const generateAccessToken = (user) => {
  try {
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    // console.log("Generated Token:", token);
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    // const user = await User.findOne({ email });
    const user = findUseById(email);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!user) {
      return res.status(404).json("User not found");
    }
    // } else if (!isMatch) {
    //   return res.status(403).json("Invalid Password");
    // }
    const token = generateAccessToken(user);

    res.json({ message: "Login successful", auth: true, token });
  } catch (error) {
    res.status(500).json("User not found");
  }

  // if (!user) {
  //   return res.status(403).json("User not found");
  // }

  // const isMatch = await bcrypt.compare(password, user.password);
  // if (!isMatch) {
  //   return res.status(404).json("Incorrect Password");
  // }

  // const jsonwebtoken = jwt.sign(
  //   {
  //     id: user._id,
  //     email: user.email,
  //     rol: user.role,
  //   },
  //   process.env.TOKEN_SECRET,
  //   {
  //     expiresIn: "1h",
  //   }
  // );

  // const accessToken = generateAccessToken(user);
  // res.json({ auth: true, jsonwebtoken, message: "Login Successful" });
  // console.log(decode(jsonwebtoken));
};

// module.exports.logout = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).send("Logout failed");
//     }
//     res.clearCookie("connect.sid"); // Adjust based on your session cookie name
//     res.status(200).send("Logged out");
//   });
// };

module.exports.check_isAuth = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authentificated" });
  }
};

// Adjust the path to your User model

module.exports.reset_pwd = async (req, res) => {
  try {
    console.log("test");
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const hashPwd = await bcrypt.hash(password, 10);
    await User.updateOne({ email: user.email }, { password: hashPwd });

    return res.status(201).send({ msg: "Password reset", success: true });
  } catch (error) {
    return res.status(500).send({ error: "Enable to hashed password" });
  }

  /**
   * const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { findUseById, getUsers } = require('../model/saveUser');

// Définir le chemin du fichier JSON
const filePath = path.join(__dirname, '../model/Utilisateur.json');

  try {
    const { email, password } = req.body;
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.email === email);
    
    if (userIndex === -1) {
      return res.status(404).send({ error: "User not found" });
    }

    const hashPwd = await bcrypt.hash(password, 10);
    users[userIndex].password = hashPwd;

    // Sauvegarder les utilisateurs mis à jour dans le fichier
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return res.status(201).send({ msg: "Password reset", success: true });
  } catch (error) {
    return res.status(500).send({ error: "Unable to reset password" });
  }
};

   */
};

module.exports.article_get = async (req, res) => {
  const { category } = req.query;
  const user = req.session.user;
  const useService = new UserService(user);
  if (
    (category === "world" || category === "health") &&
    !useService.hasAdminAccess()
  ) {
    return res.status(403).json({
      message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
    });
  }

  const key = process.env.NYT_API_KEY;
  try {
    const response = await axios.get(
      `https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${key}`
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message, diso: error });
  }
};

module.exports.devenir_admin = async (req, res, next) => {
  const user = req.session.user;

  console.log("User session in devenir_admin:", user);
  try {
    // const userId = await User.findById(user);
    // const userId = findUseById(user);

    if (!user) {
      return res.status(404).json("User not found");
    }
    user.role = "admin";
    const save = saveUser({ user });
    // await userId.save();

    next();
    res.send({ message: "User promoted to admin successful", data: user.role });
  } catch (error) {
    console.error("Promote user to admin error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.userId = async (req, res) => {
  try {
    const userId = req.session.user;
    const users = findUseById(userId);
    // const user = await User.findById(userId);
    if (!users) return res.status(404).json("User not found");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.payments = async (req, res) => {
  console.log(savePaye);

  try {
    // const data = new ClientPaye(req.body);
    const { name, email, tel } = req.body;
    const savePayer = savePaye({ name, email, tel });
    if (savePayer) {
      try {
        const response = await axios.get(
          `https://api.nytimes.com/svc/topstories/v2/world.json?api-key=${key}`
        );
        res.json(response.data.results);
      } catch (error) {
        res.status(500).json({ message: error.message, diso: error });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};
// const { name, email, telephone } = req.body;
// const user = await ClientPaye.findOne({ email });

// user = new ClientPaye({
//   name,
//   email,
//   telephone,
// });
// await user.save();
// res.json({ user });
