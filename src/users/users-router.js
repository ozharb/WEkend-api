
const express = require('express')
const path = require('path')
const UsersService = require('./user-service')
const { requireAuth } = require('../middleware/jwt-auth')
const UsersRouter = express.Router()
const jsonBodyParser = express.json()

UsersRouter
 

  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, username, fullname, nickname, city } = req.body

    for (const field of ['fullname', 'username', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: {"message": `Missing '${field}' in request body`}
        })

    // TODO: check username doesn't start with spaces

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              password: hashedPassword,
              fullname,
              nickname,
              city,
              date_created: 'now()',
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = UsersRouter