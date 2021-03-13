const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Events Endpoints', function() {
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
       beforeEach('insert eventss', () =>
          helpers.seedEventsTables(
            db,
            testUsers,
            testEvents,
            testAttendees
          )
       )
    
       describe(`GET /api/events/all`, () => {
         it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
           return supertest(app)
             .get(`/api/events/all`)
             
             .expect(401, { error: `Missing bearer token` })
         })
         it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
          const validUser = testUsers[0]
          const invalidSecret = 'bad-secret'

                 return supertest(app)
                   .get(`/api/events/all`)
                   .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                   .expect(401, { error: `Unauthorized request` })
               })
          it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'user-not-existy', id: 1 }

              return supertest(app)
                .get(`/api/events/all`)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, { error: `Unauthorized request` })
            })
       })
     }) 

  describe(`GET /api/events/all`, () => {
    beforeEach('insert users', () =>
    helpers.seedUsers(
      db,
      testUsers
    )
 )
    context(`Given no events`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/events/all')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })
  })
    context('Given there are events in the database', () => {
      beforeEach('insert events', () =>
        helpers.seedEventsTables(
          db,
          testUsers,
          testEvents,
          testAttendees,
        )
      )

      it('responds with 200 and all of the events for user', () => {
        const expectedEvents = 
          helpers.makeExpectedEvents(
            testUsers[0],
            testEvents,
            testFriends,
            testAttendees,
            testUsers
          )
        
        return supertest(app)
          .get('/api/events/all')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedEvents)
      })
    })

  //   context(`Given an XSS attack event`, () => {
  //     const testUser = helpers.makeUsersArray()[1]
  //     const {
  //       maliciousEvent,
  //       expectedEvent,
  //     } = helpers.makeMaliciousEvent(testUser)

  //     beforeEach('insert malicious event', () => {
  //       return helpers.seedMaliciousEvent(
  //         db,
  //         testUser,
  //         maliciousEvent,
  //       )
  //     })

  //     it('removes XSS attack content', () => {
  //       return supertest(app)
  //         .get(`/api/events`)
  //         .expect(200)
  //         .expect(res => {
  //           expect(res.body[0].title).to.eql(expectedEvent.title)
  //           expect(res.body[0].content).to.eql(expectedEvent.content)
  //         })
  //     })
  //   })
  // })

  // describe(`GET /api/events/:event_id`, () => {
  //   context(`Given no events`, () => {
  //     beforeEach(() =>
  //     helpers.seedUsers(db, testUsers)
  //    )
  //     it(`responds with 404`, () => {
  //       const eventId = 123456
  //       return supertest(app)
  //         .get(`/api/events/${eventId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(404, { error: `event doesn't exist` })
  //     })
  //   })

  //   context('Given there are events in the database', () => {
  //     beforeEach('insert events', () =>
  //       helpers.seedEventsTables(
  //         db,
  //         testUsers,
  //         testEvents,
  //         testReviews,
  //       )
  //     )

  //     it('responds with 200 and the specified event', () => {
  //       const eventId = 2
  //       const expectedEvent = helpers.makeExpectedEvent(
  //         testUsers,
  //         testEvents[eventId - 1],
  //         testReviews,
  //       )

  //       return supertest(app)
  //         .get(`/api/events/${eventId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200, expectedEvent)
  //     })
  //   })

  //   context(`Given an XSS attack event`, () => {
      
  //     const testUser = helpers.makeUsersArray()[1]
  //     const {
  //       maliciousEvent,
  //       expectedEvent,
  //     } = helpers.makeMaliciousEvent(testUser)

  //     beforeEach('insert malicious event', () => {
  //       return helpers.seedMaliciousEvent(
  //         db,
  //         testUser,
  //         maliciousEvent,
  //       )
  //     })
     
  //     it('removes XSS attack content', () => {
  //       return supertest(app)
  //         .get(`/api/events/${maliciousEvent.id}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUser))
  //         .expect(200)
  //         .expect(res => {
  //           expect(res.body.title).to.eql(expectedEvent.title)
  //           expect(res.body.content).to.eql(expectedEvent.content)
  //         })
  //     })
  //   })
  // })

  // describe(`GET /api/events/:event_id/reviews`, () => {
  //   context(`Given no events`, () => {
  //     it(`responds with 404`, () => {
  //       const eventId = 123456
  //       return supertest(app)
  //         .get(`/api/events/${eventId}/reviews`)
  //         .expect(404, { error: `Event doesn't exist` })
  //     })
  //   })

  //   context('Given there are reviews for event in the database', () => {
  //     beforeEach('insert events', () =>
  //       helpers.seedEventsTables(
  //         db,
  //         testUsers,
  //         testEvents,
  //         testReviews,
  //       )
  //     )

  //     it('responds with 200 and the specified reviews', () => {
  //       const eventId = 1
  //       const expectedReviews = helpers.makeExpectedEventReviews(
  //         testUsers, eventId, testReviews
  //       )

  //       return supertest(app)
  //         .get(`/api/events/${eventId}/reviews`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200, expectedReviews)
  //     })
  //   })
  // })
})
