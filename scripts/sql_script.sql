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