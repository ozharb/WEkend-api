'use strict';

const EventsService = {

  getAllEvents(knex, host) {
    return knex.select('*').from('wekend_events').where({host});
  },
  getFilteredEvents(knex, friendsIds) {
    return knex
    .from('wekend_events AS e')
    .select(
       'user.username AS Event_Host',
      'e.*',
    )
    .innerJoin(
      'wekend_users AS user',
      'e.host',
      'user.id',
    )
    .whereIn('host',friendsIds)
  },
  getFilteredEventsWithAttendees(knex, friendsIds) {
    return knex
    .from('wekend_events AS e')
    .select(
       'user.username AS Event_Host',
       'user2.username AS Event_Attendee',
       'a.alert',
      'e.*',
    )
    .innerJoin(
      'wekend_users AS user',
      'e.host',
      'user.id',
    )
    .leftJoin(
      'wekend_attendance AS a',
      'e.id',
      'a.event_id'
    )
    .leftJoin(
      'wekend_users AS user2',
      'a.attendee_id',
      'user2.id'
    )
    .whereIn('host',friendsIds)
  },
  getFilteredEventsArray(knex, friendsIds) {
    return knex
    .from('wekend_events AS e')
    .select(
       'user.username AS Event_Host',
       'user2.username AS Event_Attendee',
       knex.raw(
        `json_strip_nulls(
          json_build_object(
            'id', user2.id,
            'username', user2.username,
            'fullname', user2.fullname,
            'nickname', user2.nickname,
            'city', user2.city
          )
        ) AS "attendees"`
      )
    )
    .innerJoin(
      'wekend_users AS user',
      'e.host',
      'user.id',
    )
    .leftJoin(
      'wekend_attendance AS a',
      'e.id',
      'a.event_id'
    )
    .leftJoin(
      'wekend_users AS user2',
      'a.attendee_id',
      'user2.id'
    )
    .whereIn('host',friendsIds)
  },
  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('wekend_events')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
      .then(event =>
        EventsService.getById(knex, event.id)
      )
  },
  getByIdUser(knex, id) {
    return knex
      .from('wekend_events AS event')
      .select(
        'event.id',
        'event.title',
        'event.place',
        'event.details',
        'event.time',
        'event.day',
        'event.date_published',
        'event.host',
        knex.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'username', usr.username,
              'fullname', usr.fullname,
              'nickname', usr.nickname,
              'date_created', usr.date_created,
              'city', usr.city
            )
          ) AS "user"`
        )
      )
      .leftJoin(
        'wekend_users AS usr',
        'event.host',
        'usr.id', 
      )
      .where('usr.id', id)

  },
  getById(knex, id) {
    return knex.from('wekend_events').select('*').where('id', id).first();
  },
  deleteEvent(knex, id) {
    return knex('wekend_events')
      .where({ id })
      .delete();
  },
  updateEvent(knex, id, newEventFields) {
    return knex('wekend_events')
      .where({ id })
      .update(newEventFields);
  },
};

 

module.exports = EventsService;