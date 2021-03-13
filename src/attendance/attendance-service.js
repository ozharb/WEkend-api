'use strict';

const AttendanceService = {

  getAllAttendance(knex, user_id) {
    return knex.select('*').from('wekend_attendance').where('attendee_id', user_id);
  },
  insertAttendance(knex, newAttendance) {
    return knex
      .insert(newAttendance)
      .into('wekend_attendance')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
      .then(event =>
        AttendanceService.getByIdUser(knex, newAttendance.event_id, newAttendance.attendee_id)
      )
  },
  getByIdUser(knex, event_id, user_id) {
    return knex
      .from('wekend_attendance AS a')
      .select(
        'event.id',
        'event.title',
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
      .leftJoin('wekend_events AS event',
      'event.id',
      'a.event_id')
      .leftJoin(
        'wekend_users AS usr',
        'event.host',
        'usr.id',
      )
      .where('a.attendee_id',user_id)
      .where('event.id', event_id)
      .first()
  },
  getById(knex, id) {
    return knex.from('wekend_attendance').select('*').where('id', id).first();
  },
  deleteAttendance(knex, id, event_id) {
    return knex('wekend_attendance')
      .where('attendee_id', id)
      .andWhere('event_id', event_id)
      .delete();
  },
  updateAllAttendance(knex, event_id, attendanceToUpdate) {
    return knex('wekend_attendance')
      .where( {event_id})
      .update(attendanceToUpdate);
  },
  updateAttendance(knex, event_id, attendee_id , attendanceToUpdate) {
    return knex('wekend_attendance')
      .where({ attendee_id })
      .andWhere({ event_id} )
      .update(attendanceToUpdate);
  },
};

 

module.exports = AttendanceService;