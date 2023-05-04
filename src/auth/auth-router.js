const express = require("express");
const AuthService = require("./auth-service");
const UsersService = require("../users/user-service");
const UserService = require("../users/user-service");

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .post("/login", jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const loginUser = { username, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    AuthService.getUserWithUserName(req.app.get("db"), loginUser.username)
      .then((dbUser) => {
        if (!dbUser)
          return res.status(400).json({
            error: "Incorrect username or password",
          });
        return AuthService.comparePasswords(
          loginUser.password,
          dbUser.password
        ).then((compareMatch) => {
          if (!compareMatch)
            return res.status(400).json({
              error: "Incorrect username or password",
            });

          const sub = dbUser.username;
          const payload = { user_id: dbUser.id };

          res.send({
            authToken: AuthService.createJwt(sub, payload),
            username: dbUser.username,
          });
        });
      })
      .catch(next);
  })
  //get and send email w/ new password
  .get("/emailuser", jsonBodyParser, (req, res, next) => {
    const { username } = req.body;
    const loginUser = { username };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    AuthService.getUserEmail(req.app.get("db"), loginUser.username).then(
      (dbUser) => {
        if (!dbUser)
          return res.status(400).json({
            error: "Incorrect username",
          });

        const sub = dbUser.username;
        const payload = { user_id: dbUser.id };
        const useremail = dbUser.email;

        // generate new password for user, update db, and send it to their email

        var generator = require("generate-password");

        var newpassword = generator.generate({
          length: 10,
          numbers: true,
          symbols: true,
          uppercase: true,
        });

        //update db w/ new password

        UsersService.hashPassword(newpassword).then((hashedPassword) => {
          return UsersService.updateUserpassword(
            req.app.get("db"),
            dbUser.username,
            hashedPassword
          );
        });

        //send email w/ new password

        res.send({
          username: dbUser.username,
          email: dbUser.email,
          password: newpassword,
        });
        console.log("hello! your email is: " + dbUser.email);
        var nodemailer = require("nodemailer");

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "apiwekend@gmail.com",
            pass: process.env.EMAILPW,
          },
        });

        var mailOptions = {
          from: "apiwekend@gmail.com",
          to: "ozharb@gmail.com",
          subject: "Sending Email using Node.js",
          text: "Your new password is: " + newpassword,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        //end - email sent
      }
    );
  });

module.exports = authRouter;
