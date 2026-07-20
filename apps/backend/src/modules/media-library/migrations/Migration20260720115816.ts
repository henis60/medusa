import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260720115816 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "media_asset" drop constraint if exists "media_asset_key_unique";`);
    this.addSql(`create table if not exists "media_asset" ("id" text not null, "key" text not null, "alt_text" text null, "tags" jsonb null, "hidden" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "media_asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_media_asset_key_unique" ON "media_asset" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_media_asset_deleted_at" ON "media_asset" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "media_asset" cascade;`);
  }

}
