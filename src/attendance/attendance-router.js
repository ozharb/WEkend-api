'use strict';
const path = require('path')
const express = require('express');
const xss = require('xss');
const AttendanceService = require('./attendance-service');
const { requireAuth } = require('../middleware/jwt-auth')

const AttendanceRouter = express.Router();
const jsonParser = express.json();
const serializeEvent = event => ({ 
    ...list,
    title: xss(event.title),
    place: xss(event.place),
    details: xss(event.details),
    host: event.host
});

AttendanceRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    
    AttendanceService.getAllAttendance(
      req.app.get('db'),req.user.id)
  
      .then(attendance => {
        res.json(attendance.map(serializeList),
        );
      })
      .catch(next);
  })
  .post(requireAuth,jsonParser, (req, res, next) => {
    const { event_id } = req.body;
    const newEvent = { event_id};
    for (const [key, value] of Object.entries(newEvent)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newEvent.attendee_id = req.user.id;
    
    AttendanceService.insertAttendance(
      req.app.get('db'),
      newEvent
    )
      .then(event => {
        res
          .status(201)
         .location(path.posix.join(req.originalUrl, `/${event.id}`))
          .json(event);
      })
      .catch(next);
  })

  .delete(requireAuth,jsonParser, (req, res, next) => {

    const { event_id } = req.body
    const knexInstance = req.app.get('db');
    AttendanceService.deleteAttendance(knexInstance, req.user.id, event_id)
      .then (()=>{
      res.status(204).end()
      })
      .catch(next)
  })

  .patch(requireAuth, jsonParser, (req, res, next) => {
    const {  event_id, alert  } = req.body;
    let attendanceToUpdate = { event_id, alert  };

    const numberOfValues = Object.values(attendanceToUpdate).filter(Boolean).length;
    if (numberOfValues === 1)
      return res.status(400).json({
        error: {
          message: 'Request body must contain the \'event_id\' and \'alert\''
        }
      });
    
//updating attendance alert used for letting attendees know
//when a change has been to an event they are attending
//sets to true once change is made then user must set back to false
attendanceToUpdate = { alert  }
    AttendanceService.updateAttendance(
      req.app.get('db'),
      req.body.event_id,
      req.user.id,
      attendanceToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

AttendanceRouter
  .route('/event_id')
  .all(requireAuth)
  .all((req, res, next) => {
         AttendanceService.getById(
           req.app.get('db'),
           req.params.event_id
         )
           .then(event => {
             if (!event) {
               return res.status(404).json({
                 error: { message: `Event doesn't exist` }
               })
             }
             res.event = event // save the list for the next middleware
             next() // don't forget to call next so the next middleware happens!
           })
           .catch(next)
       })
  .get((req, res, next) => {
    res.json(serializeEvent(res.event));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    AttendanceService.deleteEvent(knexInstance, req.params.list_id)
      .then (()=>{
      res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const {  title, time, place, details, host  } = req.body;
    const eventToUpdate = { title, time, place, details, host };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'title\', \'time\',\'details\', \'place\',or \'host\''
        }
      });
    
  
    AttendanceService.updateEvent(
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
    const event = await AttendanceService.getById(
      req.app.get('db'),
      req.params.event_id
    )

    if (!event)
      return res.status(404).json({
        error: `Event doesn't exist`
      })

    res.event= event
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = AttendanceRouter;