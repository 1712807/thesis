CREATE TABLE "deals" (
  "id" Integer NOT NULL,
  "info" JSONB,
  "views" Integer,
);

CREATE TABLE "comments" (
  "id" Integer NOT NULL,
  "deal_id" Integer,
  "content" JSONB,
)

CREATE TABLE "likes" (
  "id" Integer NOT NULL,
  "deal_id" Integer,
)
