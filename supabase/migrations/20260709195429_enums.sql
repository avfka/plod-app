-- Танц-Карта: enum-типы (спек §4.1)

create type user_role as enum ('user', 'organizer', 'admin');
create type event_type as enum ('masterclass', 'championship');
create type event_status as enum ('pending', 'active', 'finished', 'cancelled');
create type booking_status as enum ('active', 'cancelled', 'attended');
create type venue_status as enum ('free', 'occupied');
create type moderation_status as enum ('pending', 'approved', 'rejected');
create type marker_icon as enum ('star', 'circle', 'square', 'diamond', 'heart');
