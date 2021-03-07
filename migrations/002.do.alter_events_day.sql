CREATE TYPE event_day AS ENUM (
    'Friday',
    'Saturday',
    'Sunday'
);

ALTER TABLE WEkend_events
  ADD COLUMN
    day event_day NOT NULL;