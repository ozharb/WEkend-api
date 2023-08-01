const bcrypt = require("bcryptjs");
const xss = require("xss");
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&`'"~;,}+|={_:[\]<>])[\S]+/;
// !@#$%^&*()+_-=}{[]|:;"/?.><,`~
const UserService = {
  getAllUsers(knex) {
    return knex.select("*").from("wekend_users");
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("wekend_users")
      .returning("*")
      .then(([user]) => user);
  },

  getById(knex, id) {
    return knex.from("wekend_users").select("*").where("id", id).first();
  },
  deleteUser(knex, id) {
    return knex("wekend_users").where({ id }).delete();
  },

  updateUserpassword(knex, username, newUserPassword) {
    console.log("new user password: " + newUserPassword);
    console.log("username: " + username);
    return knex("wekend_users")
      .where({ username })
      .update({ password: newUserPassword });
  },
  hasUserWithUserName(knex, username) {
    return knex("wekend_users")
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain one upper case, lower case, number and special character";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      fullname: xss(user.fullname),
      username: xss(user.username),
      nickname: xss(user.nickname),
      email: xss(user.email),
      city: xss(user.city),
      date_created: new Date(user.date_created),
    };
  },
};

module.exports = UserService;
