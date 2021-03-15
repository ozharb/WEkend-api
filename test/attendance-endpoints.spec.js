const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Events Endpoints', function () {
  let db

  const {
    testUsers,
    testEvents,
    testFriends,
    testAttendees,
  } = helpers.makeEventsFixtures()



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
    beforeEach('insert events', () =>
      helpers.seedEventsTables(
        db,
        testUsers,
        testEvents,
        testAttendees
      )
    )

    describe(`POST /api/attendance/all`, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .post(`/api/attendance/`)

          .expect(401, { error: `Missing bearer token` })
      })
      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'

        return supertest(app)
          .post(`/api/attendance/`)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` })
      })
      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 }

        return supertest(app)
          .post(`/api/attendance`)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })

  describe(`POST /api/attendance`, () => {

    beforeEach('insert events', () =>
    helpers.seedEventsTables(
      db,
      testUsers,
      testEvents,
      testAttendees,
    )
  )
    

   
    it('creates an attendance, responding with 201', () => {
 
      const testUser = testUsers[0]
      const newAtttendance = {
        event_id: 4
      }

      return supertest(app)
      .post('/api/attendance/')
      .set('Authorization', helpers.makeAuthHeader(testUser))
      .send(newAtttendance)
      .expect(201)
    })
  })
})

  //   it('responds with 200 and all of the events for user', () => {
      
  //     const expectedEvents =
  //       helpers.makeExpectedUserEvents(
  //         testUsers[0],
  //         testEvents,
  //         testFriends,
  //         testAttendees,
  //         testUsers
  //       )

  //     return supertest(app)
  //       .get('/api/events/all')
  //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //       .expect(200, expectedEvents)
  //   })
  // })
