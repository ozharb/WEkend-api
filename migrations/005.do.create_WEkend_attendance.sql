CREATE TABLE WEkend_attendance (
    event_id INTEGER
        REFERENCES WEkend_events(id) ON DELETE CASCADE NOT NULL,
    attendee_id INTEGER
        REFERENCES WEkend_users(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,    
    PRIMARY KEY (event_id, attendee_id)
);