const fs = require("fs");
const path = require("node:path");

const filePath = path.join(__dirname, "SaveUpgrade.json");

const savePaye = (user) => {
  let usersPaye = [];
  if (fs.existsSync(filePath)) {
    usersPaye = JSON.parse(fs.readFileSync(filePath)); // Correction ici
  }
  usersPaye.push(user);
  fs.writeFileSync(filePath, JSON.stringify(usersPaye, null, 2));
};

const getPayement = () => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
};

const findUseById = (email) => {
  const usersPaye = getUsers();
  return usersPaye.find((user) => user.email === email);
};

module.exports = { savePaye, getPayement, findUseById };
