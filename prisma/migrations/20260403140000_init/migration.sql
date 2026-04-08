CREATE TYPE "ListMemberRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE "PlaceSourceType" AS ENUM ('MANUAL', 'GOOGLE_PLACE', 'IMPORTED');
CREATE TYPE "ListPlaceStatus" AS ENUM ('PLANNED', 'VISITED', 'SKIPPED');
CREATE TYPE "TransportMode" AS ENUM ('DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT');
CREATE TYPE "RoutePlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ActivityEntityType" AS ENUM ('LIST', 'PLACE', 'ROUTE', 'MEMBERSHIP');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "avatar_url" TEXT,
  "email_verified" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "accounts" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

CREATE TABLE "sessions" (
  "id" TEXT PRIMARY KEY,
  "session_token" TEXT NOT NULL UNIQUE,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

CREATE TABLE "lists" (
  "id" TEXT PRIMARY KEY,
  "owner_user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "cover_color" TEXT,
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lists_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "lists_owner_user_id_idx" ON "lists"("owner_user_id");

CREATE TABLE "list_members" (
  "id" TEXT PRIMARY KEY,
  "list_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" "ListMemberRole" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "list_members_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "list_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "list_members_list_id_user_id_key" ON "list_members"("list_id", "user_id");
CREATE INDEX "list_members_user_id_idx" ON "list_members"("user_id");

CREATE TABLE "categories" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "icon_name" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "places" (
  "id" TEXT PRIMARY KEY,
  "source_type" "PlaceSourceType" NOT NULL DEFAULT 'MANUAL',
  "external_source_id" TEXT,
  "name" TEXT NOT NULL,
  "address_line" TEXT,
  "postal_code" TEXT,
  "city" TEXT,
  "country" TEXT,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "google_maps_url" TEXT,
  "category_id" TEXT,
  "created_by_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "places_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "places_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "places_category_id_idx" ON "places"("category_id");
CREATE INDEX "places_created_by_user_id_idx" ON "places"("created_by_user_id");
CREATE INDEX "places_city_country_idx" ON "places"("city", "country");
CREATE INDEX "places_external_source_id_idx" ON "places"("external_source_id");

CREATE TABLE "list_places" (
  "id" TEXT PRIMARY KEY,
  "list_id" TEXT NOT NULL,
  "place_id" TEXT NOT NULL,
  "note" TEXT,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" "ListPlaceStatus" NOT NULL DEFAULT 'PLANNED',
  "visited_at" TIMESTAMP(3),
  "visited_by_user_id" TEXT,
  "include_in_route" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_favorite" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "list_places_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "list_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "list_places_visited_by_user_id_fkey" FOREIGN KEY ("visited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "list_places_list_id_place_id_key" ON "list_places"("list_id", "place_id");
CREATE INDEX "list_places_list_id_status_idx" ON "list_places"("list_id", "status");
CREATE INDEX "list_places_visited_by_user_id_idx" ON "list_places"("visited_by_user_id");

CREATE TABLE "route_plans" (
  "id" TEXT PRIMARY KEY,
  "list_id" TEXT NOT NULL,
  "created_by_user_id" TEXT NOT NULL,
  "title" TEXT,
  "transport_mode" "TransportMode" NOT NULL DEFAULT 'DRIVING',
  "start_place_label" TEXT,
  "start_latitude" DECIMAL(9,6),
  "start_longitude" DECIMAL(9,6),
  "google_maps_url" TEXT,
  "status" "RoutePlanStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "route_plans_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "route_plans_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "route_plans_list_id_status_idx" ON "route_plans"("list_id", "status");
CREATE INDEX "route_plans_created_by_user_id_idx" ON "route_plans"("created_by_user_id");

CREATE TABLE "route_plan_stops" (
  "id" TEXT PRIMARY KEY,
  "route_plan_id" TEXT NOT NULL,
  "list_place_id" TEXT NOT NULL,
  "stop_order" INTEGER NOT NULL,
  "is_completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "route_plan_stops_route_plan_id_fkey" FOREIGN KEY ("route_plan_id") REFERENCES "route_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "route_plan_stops_list_place_id_fkey" FOREIGN KEY ("list_place_id") REFERENCES "list_places"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "route_plan_stops_route_plan_id_stop_order_key" ON "route_plan_stops"("route_plan_id", "stop_order");
CREATE INDEX "route_plan_stops_route_plan_id_stop_order_idx" ON "route_plan_stops"("route_plan_id", "stop_order");
CREATE INDEX "route_plan_stops_list_place_id_idx" ON "route_plan_stops"("list_place_id");

CREATE TABLE "activity_logs" (
  "id" TEXT PRIMARY KEY,
  "actor_user_id" TEXT NOT NULL,
  "list_id" TEXT,
  "entity_type" "ActivityEntityType" NOT NULL,
  "entity_id" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "payload_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "activity_logs_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "activity_logs_list_id_created_at_idx" ON "activity_logs"("list_id", "created_at");
CREATE INDEX "activity_logs_actor_user_id_created_at_idx" ON "activity_logs"("actor_user_id", "created_at");
