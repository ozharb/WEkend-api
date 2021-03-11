'use strict';
const path = require('path')
const express = require('express');
const xss = require('xss');
const FriendsService = require('./friends-service');
const EventsService = require('../events/events-service');
const { requireAuth } = require('../middleware/jwt-auth')
const serializeEvent = event => ({
  ...event,
  title: xss(event.title),
  place: xss(event.place),
  details: xss(event.details),
  host: event.host
});
const FriendsRouter = express.Router();
const jsonParser = express.json();
let friendsIds = []
FriendsRouter
  .route('/')
  .all(requireAuth)
  .get(async (req, res, next) => {

    try {
      const friendsArray = await FriendsService.getAllFriendsByIdUser(
        req.app.get('db'), req.user.id)
      for (let fr of friendsArray) {
        fr.sender_id === req.user.id
          ? fr['friend'] = fr.receiver
          : fr['friend'] = fr.sender
      }
      for (let fr of friendsArray) {
        fr.sender_id === req.user.id
          ? fr['friend_id'] = fr.receiver_id
          : fr['friend_id'] = fr.sender_id
      }
      res.status(200).json(friendsArray)
      next()

    } catch (error) {
      next(error)
    }

  })
  //**Turn filter on and off for friends */
  //turning off or on a friend filter might mean the front end wants different event data
  //so a patch could send back updated events automatically as implemented below
  // This patch for freind filter automatically sends backs new
  //event data with the new filters. 

  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { friend_id, friend_filter } = req.body;
    const friendToUpdate = { friend_id, friend_filter };

    const numberOfValues = Object.values(friendToUpdate).filter(Boolean).length;
    if (numberOfValues === 1)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a \'friend_id\' and \'friend_filter\''
        }
      });
    let filter = {}
    //find out if user is the sender or requester then peform specific update on db
    FriendsService.getSpecificFriend(
      req.app.get('db'), req.user.id, friendToUpdate.friend_id)
      /// get just the ids of friends that are confirmed and filter is off

      .then(friendship => {

        let isReceiver = friendship[0].receiver_id === req.user.id

        if (isReceiver) {
          filter = {
            receiver_filter: friendToUpdate.friend_filter
          }

        } else {
          filter = {
            sender_filter: friendToUpdate.friend_filter
          }
        }
        FriendsService.updateFriendFilter(
          req.app.get('db'),
          req.user.id,
          friendToUpdate.friend_id,
          filter
        )
          .then(() => {
            //***get new events and send back to the front end.***///
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
                      attendance['alert'] = ev.alert
                      result.push(attendance)
                    }
                    //add usernames of attendees to the list of events for user
                    //add alert status to each attendee.
                    EventsService.getFilteredEvents(
                      req.app.get('db'), friendsIds)
                      .then(eventsNoAttendees => {
                        console.log(result)
                        for (let ev of eventsNoAttendees) {
                          let alert = result.filter(att => att[ev.id] === req.user.username).length === 1 ?
                            result.filter(att => att[ev.id] === req.user.username)[0].alert
                            : null
                          ev['alert'] = alert
                          ev["attendees"] = result.filter(att => att[ev.id]).reduce((arr, el) => {
                            arr.push({ 'username': el[ev.id], 'alert': el['alert'] })
                            return arr
                          }, [])
                          // .map(el => [el[ev.id], el['alert']])
                        }
                        res.json(eventsNoAttendees.map(serializeEvent))

                      })
                  })
              })
              .catch(next);

          })
      })

  })

  .delete(jsonParser, (req, res, next) => {
    const { friend_id } = req.body;
    const friendToUpdate = { friend_id };

    const numberOfValues = Object.values(friendToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a \'friend_id\''
        }
      });
    let friendVal = {}
    //find out if user is the sender or requester then peform specific update on db
    FriendsService.getSpecificFriend(
      req.app.get('db'), req.user.id, friendToUpdate.friend_id)
      /// get just the ids of friends that are confirmed and filter is off

      .then(friendship => {
        console.log("FRIENDSHIP:", friendship)
        let isReceiver = friendship[0].receiver_id === req.user.id

        if (isReceiver) {
          friendVal = {
            receiver_id: req.user.id,
            sender_id: friendToUpdate.friend_id
          }

        } else {
          friendVal = {
            sender_id: req.user.id,
            receiver_id: friendToUpdate.friend_id
          }
        }
        FriendsService.deleteFriend(
          req.app.get('db'),
          friendVal
        )
          .then(numRowsAffected => {
            res.status(204).end();
          })
      })
  })

//this is just for demo purposes...
FriendsRouter
  .route('/ids')
  .all(requireAuth)
  .get(async (req, res, next) => {
    // get all ids for user's friends as an array of objects
    //    [{
    //     "sender": 11,
    //     "receiver": 12
    //        },]

    try {
      const friendIdsArray = await FriendsService.getByIdUser(
        req.app.get('db'), req.user.id)
      /// get just the ids of friends that are confirmed and filter is off
      const friendIds = friendIdsArray.reduce((arr, el) => {
        el.sender === req.user.id ? arr.push(el.receiver) : arr.push(el.sender)
        return arr
      }, []
      )
      res.status(200).json(friendIds)
      next()

    } catch (error) {
      next(error)
    }

  })
//Not using this right now
FriendsRouter
  .route('/info')
  .all(requireAuth)
  .get(async (req, res, next) => {
    // get all ids for user's friends as an array of objects
    //    [{
    //     "sender": 11,
    //     "receiver": 12
    //        },]

    try {
      const friendsArray = await FriendsService.getInfoByIdUser(
        req.app.get('db'), req.user.id)
      /// get friends that are confirmed and filter is off
      // const friendIds = friendIdsArray.reduce((arr, el)=>{
      //   el.sender===req.user.id?arr.push(el.receiver):arr.push(el.sender)
      //   return arr
      // }, []
      // )
      res.status(200).json(friendsArray)
      next()

    } catch (error) {
      next(error)
    }



  })

/// SEND AND ACCEPT FREIND REQUESTS

FriendsRouter
  .route('/request')
  .all(requireAuth)
  // get all friend requests for user...may not be needed.
  .get((req, res, next) => {

    FriendsService.getByIdUser(
      req.app.get('db'), req.user.id)

      .then(friend => {
        res.json(friend)
      })
      .catch(next);
  })
  // send friend request
  //should check if request already exists between users

  .post(requireAuth, jsonParser, (req, res, next) => {
    const { receiver_id } = req.body;
    const newFriend = { receiver_id };
    for (const [key, value] of Object.entries(newFriend)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    FriendsService.checkId(
      req.app.get('db'),
      newFriend.receiver_id
    )
      .then(idExists => {
        console.log("idExists:", idExists)
        if (!idExists)
          return res.status(400).json({ error: 'cannot find user id' })


        FriendsService.checkFriendRequest(
          req.app.get('db'),
          req.user.id,
          newFriend
        )
          .then(frienshipError => {
            console.log("frienshipError:", frienshipError)
            if (frienshipError)
              return res.status(400).json({ error: 'You may already be friends with this user or have sent or received a friend request from them. Please check your friend dashboard' })


            newFriend.sender_id = req.user.id;
            newFriend.confirmed = false;
  

            FriendsService.insertFriendRequest(
              req.app.get('db'),
              newFriend
            )
              .then(friend => {
                    FriendsService.getAllFriendsByIdUser(
                  req.app.get('db'), req.user.id)
                  .then(friendsArray =>{

                for (let fr of friendsArray) {
                  fr.sender_id === req.user.id
                    ? fr['friend'] = fr.receiver
                    : fr['friend'] = fr.sender
                }
                for (let fr of friendsArray) {
                  fr.sender_id === req.user.id
                    ? fr['friend_id'] = fr.receiver_id
                    : fr['friend_id'] = fr.sender_id
                }
                console.log("FRIEND:",friend)
                res
                  .status(201)
                  .json(friendsArray.find(fr=>(fr.receiver_id === friend[0].receiver_id)&& (fr.sender_id===friend[0].sender_id)));
              })
            })
          })
      })
      .catch(next);
  })

  //accept friend request only

  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { sender_id, confirmed } = req.body;
    const friendToUpdate = { sender_id, confirmed };

    const numberOfValues = Object.values(friendToUpdate).filter(Boolean).length;
    if (numberOfValues === 1)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a sender_id and \'confirmed\''
        }
      });


    FriendsService.updateFriendRequest(
      req.app.get('db'),
      req.user.id,
      friendToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
//find endpoint requests username from client but
// but will query db by username, full name, and nick name
// and is case insensitive to maximize search results

FriendsRouter
  .route('/find')
  .all(requireAuth)
  .post(jsonParser, (req, res, next) => {
    const { username } = req.body;
    const friendTofind = { username };
console.log('REQUEST:', friendTofind)
    const numberOfValues = Object.values(friendTofind).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a username'
        }
      });
    FriendsService.getByUsername(
      req.app.get('db'),
      friendTofind.username
    )
      .then(friend => {
        if (!friend) {
          return res.status(404).json({
            error: { message: `user doesn't exist` }
          })
        }
        console.log('reulsts:', friend)
        res.json(friend); // save the list for the next middleware
        // don't forget to call next so the next middleware happens!
      })
      .catch(next)
  })
 


  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { sender_id, receiver_id, sender_filter, receiver_filter, confirmed } = req.body;
    const friendToUpdate = {};

    const numberOfValues = Object.values(friendToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'sender_filter\', \'receiver_filter\',or \'confirmed\''
        }
      });


    FriendsService.updateFriend(
      req.app.get('db'),
      req.params.friend_id,
      friendToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

/* async/await syntax for promises */
// async function checkFriendExists(req, res, next) {
//   try {
//     const friend = await FriendsService.getById(
//       req.app.get('db'),
//       req.params.friend_id
//     )

//     if (!friend)
//       return res.status(404).json({
//         error: `Friend doesn't exist`
//       })

//     res.friend= friend
//     next()
//   } catch (error) {
//     next(error)
//   }
// }

module.exports = FriendsRouter