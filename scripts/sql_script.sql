CREATE TABLE "category" (
	"id" serial PRIMARY KEY,
	"display_name"	TEXT
);

CREATE TABLE "template" (
	"id" serial PRIMARY KEY,
	"category_id"	INTEGER NOT NULL,
	"content"	TEXT,
	"whatsapp_approved" BOOLEAN,
	"is_deleted" BOOLEAN
);


CREATE TABLE "configuration" (
	"id" serial PRIMARY KEY,
	"info"	json NOT NULL,
	"updated_on" timestamptz NOT NULL,
	"updated_by" VARCHAR(255) NOT NULL
);

CREATE TABLE "claim" (
	"id" serial PRIMARY KEY,
	"user"	VARCHAR(255) NOT NULL,
	"started_at" timestamptz NOT NULL,
	"ended_at" timestamptz NULL
);