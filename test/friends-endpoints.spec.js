const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Friends Endpoints', function () {
  let db

  const {
    testUsers,
    testFriends
  } = helpers.makeFriendsFixtures()



  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`Protected endpoints`, () => {
    beforeEach('insert friends', () =>
      helpers.seedFriendsTables(
        db,
        testUsers,
        testFriends
      )
    )

    describe(`GET /api/friends/`, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .get(`/api/friends/`)

          .expect(401, { error: `Missing bearer token` })
      })
      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
          .get(`/api/friends/`)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` })
      })
      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 }

        return supertest(app)
          .get(`/api/friends`)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })

  describe(`GET /api/friends`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    context(`Given no friends`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/friends/')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })
  })

  context('Given there are friends in the database', () => {

    beforeEach('insert friends', () =>
      helpers.seedFriendsTables(
        db,
        testUsers,
        testFriends,
      )
    )
    it('responds with 200 and all of the events for user', () => {
      
      const expectedFriends =
        helpers.makeExpectedUserFriends(
          testUsers[0],
          testUsers,
          testFriends,
        )

      return supertest(app)
        .get('/api/friends/')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedFriends)
    })
  })
})

 

