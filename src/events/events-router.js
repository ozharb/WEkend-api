'use strict';
const path = require('path')
const express = require('express');
const xss = require('xss');
const EventsService = require('./events-service');
const FriendsService = require('../friends/friends-service');
const AttendanceService = require('../attendance/attendance-service');
const { requireAuth } = require('../middleware/jwt-auth')

const EventsRouter = express.Router();
const jsonParser = express.json();
const serializeEvent = event => ({
  ...event,
  title: xss(event.title),
  place: xss(event.place),
  details: xss(event.details),
});

EventsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {

    EventsService.getAllEvents(
      req.app.get('db'), req.user.id)

      .then(events => {
        res.json(events.map(serializeEvent),
        );
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { title, time, place, details, day } = req.body;
    const newEvent = { title, time, day };
    for (const [key, value] of Object.entries(newEvent)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newEvent.host = req.user.id;
    newEvent.place = place;
    newEvent.details = details;

    EventsService.insertEvent(
      req.app.get('db'),
      newEvent
    )
      .then(event => {
        const newEvent = { event_id: event.id };

        newEvent.attendee_id = req.user.id;

        AttendanceService.insertAttendance(
          req.app.get('db'),
          newEvent
        )

        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${event.id}`))
          .json(event);
      })
      .catch(next);
  })
    //when a change is made to an event, all attendees should be notified. 
  //set alert status to true for all attnendances

  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { id, title, time, place, details, day } = req.body;
    const eventToUpdate = { id, title, time, place, details, day };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 1)
      return res.status(400).json({
        error: {
          message: 'Request body must contain \'id\' and either \'title\', \'time\', \'place\',\'details\', or \'day\''
        }
      });
    EventsService.updateEvent(
      req.app.get('db'),
      id,
      eventToUpdate
    )
      .then( () => {
       let attendanceToUpdate = { alert: "true"}
        AttendanceService.updateAllAttendance(
          req.app.get('db'),
          id,
          attendanceToUpdate
        )
        .then(()=>{

          res
          .status(204)
          .end()
         
        })

        
      })
      .catch(next);
  })
  .delete(requireAuth, jsonParser, (req, res, next) => {
    const { event_id } = req.body;
    const event = { event_id };
    for (const [key, value] of Object.entries(event)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    const knexInstance = req.app.get('db');
    EventsService.deleteEvent(knexInstance, event.event_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

let friendsIds = []
EventsRouter
  .route('/all')
  .all(requireAuth)
  .get((req, res, next) => {

    FriendsService.getByIdUser(
      req.app.get('db'), req.user.id)
/// get just the ids of friends that are confirmed and filter is off
      .then(friendIdsArray => {
        friendsIds = friendIdsArray.reduce((arr, el) => {
          el.sender === req.user.id ? arr.push(el.receiver) : arr.push(el.sender)
          return arr
        }, [])
        friendsIds.push(req.user.id)
//use the ids to generate list of event ids and usernames of attendees

        EventsService.getFilteredEventsWithAttendees(
          req.app.get('db'), friendsIds)

          .then(eventRes => {
            let result = []
            for (let ev of eventRes) {
              let attendance = {}
              attendance[ev.id] = ev.Event_Attendee
              attendance['alert']= ev.alert
              result.push(attendance)
            }
//add usernames of attendees to the list of events for user
//add alert status to each attendee.
            EventsService.getFilteredEvents(
              req.app.get('db'), friendsIds)
              .then(eventsNoAttendees => {
                for (let ev of eventsNoAttendees) {
                  let alert = result.filter(att => att[ev.id]===req.user.username).length===1 ?
                  result.filter(att => att[ev.id]===req.user.username)[0].alert
                  : null
                  ev['alert'] = alert
                  ev["attendees"] = result.filter(att => att[ev.id]).reduce((arr, el)=>{
                    arr.push({'username': el[ev.id], 'alert': el['alert']})
                    return arr
                  },[])
                  // .map(el => [el[ev.id], el['alert']])
                }
                res.json(eventsNoAttendees.map(serializeEvent))

              })

          })

      })

      .catch(next);


  })
/// not using this right now
EventsRouter
  .route('/event/:event_id')
  .all(requireAuth)
  .get((req, res, next) => {
    EventsService.getById(
      req.app.get('db'),
      req.params.event_id
    )
      .then(event => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        res.json(serializeEvent(event))

      })
      .catch(next)
    })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    EventsService.deleteEvent(knexInstance, req.params.list_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

  
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { title, time, place, details } = req.body;
    const eventToUpdate = { title, time, place, details };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'title\', \'time\',\'details\', or \'place\''
        }
      });


    EventsService.updateEvent(
      req.app.get('db'),
      req.params.event_id,
      eventToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

/* async/await syntax for promises */
async function checkEventExists(req, res, next) {
  try {
    const event = await EventsService.getById(
      req.app.get('db'),
      req.params.event_id
    )

    if (!event)
      return res.status(404).json({
        error: `Event doesn't exist`
      })

    res.event = event
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = EventsRouter;