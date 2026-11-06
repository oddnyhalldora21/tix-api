
DELETE FROM bookings;
DELETE FROM tickets;
DELETE FROM events;
DELETE FROM categories;
DELETE FROM venues;
DELETE FROM users;


ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE venues_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE tickets_id_seq RESTART WITH 1;
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;

-- Insert Users (passwords will be hashed in real app, these are just examples)
INSERT INTO users (name, email, password, created_at) VALUES
('Jón Jónsson', 'jon@example.com', 'hashed_password_1', '2026-01-03 14:30:00'),
('Siggi Sigurðsson', 'siggi@example.com', 'hashed_password_2', '2026-01-04 16:45:00'),
('Elsa Jónsdóttir', 'elsa@example.com', 'hashed_password_3', '2026-01-05 11:20:00');

-- Insert Venues
INSERT INTO venues (name, address, city, capacity, created_at) VALUES
('Harpa Concert Hall', 'Austurbakki 2', 'Reykjavík', 1800, '2026-01-03 09:00:00'),
('Laugardalshöll', 'Engjavegur 8', 'Reykjavík', 5500, '2026-01-03 09:15:00'),
('Eldborg', 'Austurbakki 2', 'Reykjavík', 750, '2026-01-03 09:30:00'),
('Akureyri Theater', 'Hafnarstræti 57', 'Akureyri', 400, '2026-01-03 10:00:00');

-- Insert Categories
INSERT INTO categories (name, description, created_at) VALUES
('Concert', 'Live music performances', '2026-01-03 08:00:00'),
('Sports', 'Sporting events and competitions', '2026-01-03 08:15:00'),
('Theater', 'Theatrical performances and plays', '2026-01-03 08:30:00'),
('Comedy', 'Stand-up comedy shows', '2026-01-03 08:45:00'),
('Festival', 'Music and cultural festivals', '2026-01-03 09:00:00');

-- Insert Events
-- Dates are relative to when the seed is run, so events 1-6 are always in the
-- future and event 7 is always in the past (used by the tests).
INSERT INTO events (name, description, event_date, venue_id, category_id, created_at) VALUES
('Kaleo Live', 'Icelandic rock band performing their greatest hits', date_trunc('day', NOW()) + interval '2 months' + interval '20 hours', 1, 1, '2026-01-04 10:00:00'),
('Iceland vs Norway', 'International handball match', date_trunc('day', NOW()) + interval '1 month' + interval '18 hours', 2, 2, '2026-01-04 11:00:00'),
('Hamlet', 'Classic Shakespearean tragedy', date_trunc('day', NOW()) + interval '3 months' + interval '19 hours 30 minutes', 3, 3, '2026-01-05 09:00:00'),
('Ari Eldjárn', 'Stand-up comedy in Icelandic', date_trunc('day', NOW()) + interval '2 months 5 days' + interval '21 hours', 3, 4, '2026-01-05 10:00:00'),
('Secret Solstice', 'Three-day music festival', date_trunc('day', NOW()) + interval '6 months' + interval '14 hours', 2, 5, '2026-01-05 11:00:00'),
('Of Monsters and Men', 'Album release concert', date_trunc('day', NOW()) + interval '4 months' + interval '20 hours', 1, 1, '2026-01-06 09:00:00'),
('Past Event Test', 'This event is in the past for testing', date_trunc('day', NOW()) - interval '1 month' + interval '20 hours', 4, 1, '2026-01-04 15:00:00');

-- Insert Tickets
INSERT INTO tickets (event_id, price, available_quantity, total_quantity, ticket_type, created_at) VALUES
-- Kaleo Live (event 1)
(1, 8900.00, 500, 500, 'Standard', '2026-01-04 10:30:00'),
(1, 15900.00, 100, 100, 'VIP', '2026-01-04 10:35:00'),
-- Iceland vs Norway (event 2)
(2, 3500.00, 1000, 1000, 'Standard', '2026-01-04 11:30:00'),
(2, 2500.00, 200, 200, 'Student', '2026-01-04 11:35:00'),
-- Hamlet (event 3)
(3, 4500.00, 300, 300, 'Standard', '2026-01-05 09:30:00'),
-- Ari Eldjárn (event 4)
(4, 5500.00, 400, 400, 'Standard', '2026-01-05 10:30:00'),
-- Secret Solstice (event 5)
(5, 25900.00, 2000, 2000, 'Weekend Pass', '2026-01-05 11:30:00'),
(5, 12900.00, 1000, 1000, 'Day Pass', '2026-01-05 11:35:00'),
-- Of Monsters and Men (event 6)
(6, 9900.00, 600, 600, 'Standard', '2026-01-06 09:30:00'),
(6, 18900.00, 150, 150, 'VIP', '2026-01-06 09:35:00'),
-- Past Event (event 7)
(7, 5000.00, 100, 100, 'Standard', '2026-01-04 15:30:00');

-- Insert Bookings
INSERT INTO bookings (user_id, ticket_id, quantity, total_price, status, booking_date) VALUES
-- Jón bought 2 standard Kaleo tickets
(1, 1, 2, 17800.00, 'confirmed', '2026-01-07 14:00:00'),
-- Siggi bought 1 VIP Kaleo ticket
(2, 2, 1, 15900.00, 'confirmed', '2026-01-08 15:30:00'),
-- Elsa bought 4 handball tickets
(3, 3, 4, 14000.00, 'confirmed', '2026-01-09 10:00:00'),
-- Jón also bought festival pass (but cancelled it)
(1, 7, 1, 25900.00, 'cancelled', '2026-01-07 16:00:00');