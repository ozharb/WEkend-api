CREATE TABLE WEkend_friends (
sender_id INTEGER REFERENCES WEkend_users(id) ON DELETE CASCADE NOT NULL,
receiver_id INTEGER REFERENCES WEkend_users(id) ON DELETE CASCADE NOT NULL,
sender_filter Boolean DEFAULT false,
receiver_filter Boolean DEFAULT false,
confirmed Boolean,
date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
PRIMARY KEY (sender_id, receiver_id)
);