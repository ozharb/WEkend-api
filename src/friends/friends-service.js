'use strict';

const FriendsService = {

  getAllFriends(knex, host) {
    return knex.select('*').from('wekend_friends').where({host});
  },
  checkId(knex, id) {
    return knex('wekend_users')
      .where({id})
      .first()
      .then(userExists => !!userExists)
  },
  checkFriendRequest(knex, sender_id, newFriend) {
    return knex('wekend_friends')
      .where({sender_id})
      .andWhere(newFriend)
      .orWhere('receiver_id', sender_id)
      .andWhere('sender_id',newFriend.receiver_id)
      .first()
      .then(friendRequest => !!friendRequest)
  },
  //send friend request 
  insertFriendRequest(knex, newFriend) {
    return knex
      .insert(newFriend)
      .into('wekend_friends')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
      .then(friend =>
        FriendsService.getByIds(knex, friend.sender_id, friend.receiver_id)
      )
  },
  getSpecificFriend(knex, id, friend_id) {
    return knex
      .from('wekend_friends AS f')
      .select(
        "f.*"
      )
      .where(function () {
        this
          .where('f.sender_id', id)
          .andWhere('f.receiver_id', friend_id)
          .orWhere('f.receiver_id', id)
          .andWhere('f.sender_id', friend_id)
      })
  },
  getByIdUser(knex, id) {
    return knex
      .from('wekend_friends AS f')
      .select(
        'u1.id AS sender',
        'u2.id As receiver',
      )
      .innerJoin(
        'wekend_users AS u1',
        'f.sender_id',
        'u1.id',
      )
      .innerJoin(
        'wekend_users AS u2',
        'f.receiver_id',
        'u2.id',
      )
      .where(function () {
        this
          .where('u1.id', id)
          .andWhere('f.confirmed', 'true')
          .andWhere('f.sender_filter', 'false')
          .orWhere('u2.id', id)
          .andWhere('f.confirmed', 'true')
          .andWhere('f.receiver_filter', 'false')
      })
   
  },
  getAllFriendsByIdUser(knex, id) {
    return knex
      .from('wekend_friends AS f')
      .select(
        'u1.username AS sender',
        'u2.username As receiver',
        'f.*'
      )
      .innerJoin(
        'wekend_users AS u1',
        'f.sender_id',
        'u1.id',
      )
      .innerJoin(
        'wekend_users AS u2',
        'f.receiver_id',
        'u2.id',
      )
      .where(function () {
        this
          .where('u1.id', id)
          .orWhere('u2.id', id)
      })
  },
  getInfoByIdUser(knex, id) {
    return knex
      .from('wekend_friends AS f')
      .select(
        'u1.username AS sender',
        'u2.username As receiver',
        'f.*'
      )
      .innerJoin(
        'wekend_users AS u1',
        'f.sender_id',
        'u1.id',
      )
      .innerJoin(
        'wekend_users AS u2',
        'f.receiver_id',
        'u2.id',
      )
      .where(function () {
        this
          .where('u1.id', id)
          .andWhere('f.confirmed', 'true')
          .andWhere('f.sender_filter', 'false')
          .orWhere('u2.id', id)
          .andWhere('f.confirmed', 'true')
          .andWhere('f.receiver_filter', 'false')
      })
  },
  getByUsername(knex, username) {
    return knex('wekend_users AS u')
      .select(
        'u.username',
        'u.id',
        'u.nickname',
        'u.city'
      )
      .where( 'username', 'ilike', username )
      .orWhere('nickname', 'ilike', username)
      .orWhere('fullname', 'ilike', username)
   
  },
  getByIds(knex, sender_id, receiver_id) {
    return knex.from('wekend_friends')
    .select('*')
    .where('sender_id', sender_id)
    .andWhere('receiver_id', receiver_id);
  },
  deleteFriend(knex, friendIds) {
    return knex('wekend_friends AS f')
    .where(friendIds)
      .delete();
  },
  updateFriendRequest(knex, id, friendToUpdate) {
    return knex('wekend_friends AS f')
      .where('f.receiver_id',  id)
      .andWhere('f.sender_id', friendToUpdate.sender_id)
      .update({confirmed: friendToUpdate.confirmed});
  },
  updateFriendFilter(knex, id, friendToUpdate_id, filter) {
    return knex('wekend_friends AS f')
      .where('f.sender_id', id)
      .andWhere('f.receiver_id', friendToUpdate_id)
      .orWhere('f.receiver_id',  id)
      .andWhere('f.sender_id', friendToUpdate_id)
      .update(filter);
  },
};

 

module.exports = FriendsService;