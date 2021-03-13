const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      fullname: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      fullname: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      fullname: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      fullname: 'Test user 4',
      nickname: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeEventsArray(users) {
  return [
    {
      id: 1,
      date_published: '2021-01-22T16:28:32.615Z',
      title: 'Dinner',
      time: '20:00:00',
      place: 'Vitos',
      day: 'Friday',
      details: 'Italian food and live music',
      host: users[0].id
    },
    {
      id: 2,
      date_published: '2021-01-20T15:28:32.615Z',
      title:'Jog',
      time: '12:00:00',
      place: 'Lake',
      day: 'Saturday',
      details: 'Jogging',
      host: users[1].id,
    },
    {
      id: 3,
      date_published: '2021-01-22T15:20:32.615Z',
      time: '15:00:00',
      title:'Study',
      place: 'Library',
      day: 'Sunday',
      details: 'Researching things',
      host: users[2].id
    },
    {
      id: 4,
      date_published: '2021-03-24T14:28:32.615Z',
      title: 'Night out',
      time: '17:00:00',
      place: 'Club 21',
      day: 'Saturday',
      details: 'Dinner and drinks',
      host: users[3].id
    },
  ];
}
function makeAttendeesArray(users){
  return[
    {
      event_id: 1, 
      attendee_id:users[0].id, 
      alert: false
    },
    {
      event_id: 2, 
      attendee_id:users[0].id, 
      alert: false
    },
    {
      event_id: 3, 
      attendee_id:users[0].id, 
      alert: false
    },
    {
      event_id: 1, 
      attendee_id:users[1].id, 
      alert: false
    },
    {
      event_id: 2, 
      attendee_id:users[1].id, 
      alert: false
    },
    {
      event_id: 3, 
      attendee_id:users[2].id, 
      alert: false
    },
  ]
}
function makeFriendsArray(users) {
  return [
    {
      sender_id:users[0].id,
      receiver_id: users[1].id,
      sender_filter: false,
      receiver_filter: false,
      confirmed: false,
      date_created: '2021-01-22T16:28:32.615Z',
    },
    {
        sender_id: users[1].id,
        receiver_id: users[2].id,
        sender_filter: false,
        receiver_filter: false,
        confirmed: true,
        date_made: '2019-01-12T16:28:32.615Z',
    },
    {
      sender_id: users[2].id,
      receiver_id: users[3].id,
      sender_filter: false,
      receiver_filter: false,
      confirmed: true,
      date_made: '2019-01-12T16:28:32.615Z',
    },
    {
      sender_id: users[3].id,
      receiver_id: users[1].id,
      sender_filter: false,
      receiver_filter: false,
      confirmed: true,
      date_made: '2021-01-12T14:28:32.615Z',
    },
  ];
}
function makeExpectedEvent(users, event, attendees=[]) {
  const eventUser = users
    .find(user => user.id === event.host)

  const eventAttendees = attendees
    .filter(attendee => attendee.event_id === event.id)

  return {
    Event_Host: eventUser.username,
    alert: false,
    id: event.id,
    title: event.title,
    date_published: event.date_published,
    host:eventUser.id,
    time: event.time,
    details: event.details,
    place: event.place,
    day: event.day,
    attendees: eventAttendees
  }
}
function makeExpectedEvents(user, events=[], friends=[], attendees = [], users) {

  function getevAttendees(event, users, attendees){
    let evAttendees = attendees.filter(at=>at.event_id===event.id)
    
    let names = {}
    for(let u of users){
     names[u.id] = u.username
    }
   let res = []
   for(let attendeeU of evAttendees){
      let obj = {}
      obj['username'] = names[attendeeU.attendee_id]
      obj['alert'] = false
      res.push(obj)
   }
   return res
  }
  let friendship = friends.filter(fr => fr.confirmed && (fr.sender_id===user.id || fr.receiver_id ===user.id))

  let frIds = friendship
  .map(fr=>[fr.sender_id,fr.receiver_id])
  .reduce((a,b)=>{return a.concat(b)},[])
  let eventRes = events
  .filter(ev=>(ev.host === user.id) || frIds
  .includes(ev.host))
  for (let ev of eventRes){

    ev['Event_Host']= users.find(user=>user.id===ev.host)['username']
    ev['alert'] = false
    ev['attendees'] = getevAttendees(ev,users,attendees)
  }
  return eventRes
  }

function makeMaliciousEvent (user) {
  const maliciousEvent = {
    id: 911,
    date_published: new Date(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    place: 'Naughty naughty very naughty <script>alert("xss");</script>',
    details: 'Naughty naughty very naughty <script>alert("xss");</script>',
    host: user.id
  }
  const expectedEvent = {
    ...makeExpectedEvent([user], maliciousEvent),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    place: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    details: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousEvent,
    expectedEvent,
  }
}

function makeEventsFixtures() {
  const testUsers = makeUsersArray()
  const testEvents = makeEventsArray(testUsers)
  const testFriends = makeFriendsArray(testUsers)
  const testAttendees = makeAttendeesArray(testUsers)
  return { testUsers, testEvents, testFriends, testAttendees}
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        wekend_events,
        wekend_users,
        wekend_friends,
        wekend_attendance
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE wekend_events_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE wekend_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('wekend_events_id_seq', 0)`),
        trx.raw(`SELECT setval('wekend_users_id_seq', 0)`),
      ])
    )
  )
}
function seedUsers(db, users) {
     const preppedUsers = users.map(user => ({
       ...user,
       password: bcrypt.hashSync(user.password, 1)
     }))
     return db.into('wekend_users').insert(preppedUsers)
       .then(() =>
         // update the auto sequence to stay in sync
         db.raw(
           `SELECT setval('wekend_users_id_seq', ?)`,
           [users[users.length - 1].id],
         )
       )
   }

function seedEventsTables(db, users, events, attendees=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('wekend_events').insert(events)
    // update the auto sequence to match the forced id values
    await trx.raw(
             `SELECT setval('wekend_events_id_seq', ?)`,
             [events[events.length - 1].id],
           )
    // only insert items if there are some, also update the sequence counter
    if (attendees.length) {
      await trx.into('wekend_attendance').insert(attendees)
    }
  })
}

function seedMaliciousEvent(db, user, event) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('wekend_events')
        .insert([event])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
         subject: user.username,
         algorithm: 'HS256',
       })
     return `Bearer ${token}`
   }
  

module.exports = {
  makeUsersArray,
  makeEventsArray,
  makeExpectedEvent,
  makeExpectedEvents,
  makeMaliciousEvent,
  makeFriendsArray,
  makeAttendeesArray,
  seedUsers,
  makeEventsFixtures,
  cleanTables,
  seedEventsTables,
  seedMaliciousEvent,
  makeAuthHeader,
}