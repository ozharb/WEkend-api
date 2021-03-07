BEGIN;

TRUNCATE
  WEkend_events,
  WEkend_friends,
  WEkend_attendance,
  WEkend_users
  RESTART IDENTITY CASCADE;

INSERT INTO WEkend_users (username, fullname, nickname, password, city)
VALUES
  ('dunder', 'Dunder Mifflin', null, '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne', 'Seattle'),
  ('b.deboop', 'Bodeep Deboop', 'Bo', '$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO','Seattle'),
  ('c.bloggs', 'Charlie Bloggs', 'Charlie', '$2a$12$2fv9OPgM07xGnhDbyL6xsuAeQjAYpZx/3V2dnu0XNIR27gTeiK2gK','Seattle'),
  ('s.smith', 'Sam Smith', 'Sam', '$2a$12$/4P5/ylaB7qur/McgrEKwuCy.3JZ6W.cRtqxiJsYCdhr89V4Z3rp.', 'Seattle'),
  ('lexlor', 'Alex Taylor', 'Lex', '$2a$12$Hq9pfcWWvnzZ8x8HqJotveRHLD13ceS7DDbrs18LpK6rfj4iftNw.', 'Seattle'),
  ('wippy', 'Ping Won In', 'Ping', '$2a$12$ntGOlTLG5nEXYgDVqk4bPejBoJP65HfH2JEMc1JBpXaVjXo5RsTUu', 'Portland');




INSERT INTO WEkend_events (title, time, place, details, day, host)
VALUES

('Dinner', '20:00', 'Vitos','Italian food and live music','Friday', 2),
('Brunch', '12:00', 'Lost Lake', 'Bottomless mimosas', 'Saturday', 3),
('Wine Tour', '14:00', 'Saint Michel Vineyard','Picnic after', 'Saturday', 3),
('Shopping', '13:30', 'Westlake','Sale at Barneys', 'Sunday', 3);


INSERT INTO WEkend_friends (sender_id, receiver_id, sender_filter, receiver_filter, confirmed)
VALUES
(1,2, true, true, false),
(3,1, false, true, true),
(5,3, false, true, true),
(1,4, true, false, true),
(2,3, true, true, false),
(2,4,true, true, true);

INSERT INTO WEkend_attendance (event_id, attendee_id)
VALUES
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(2,3);

COMMIT;
