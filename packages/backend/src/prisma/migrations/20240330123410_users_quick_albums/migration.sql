-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_albums" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zippedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "albums_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_albums" ("createdAt", "description", "editedAt", "id", "name", "nsfw", "userId", "uuid", "zippedAt") SELECT "createdAt", "description", "editedAt", "id", "name", "nsfw", "userId", "uuid", "zippedAt" FROM "albums";
DROP TABLE "albums";
ALTER TABLE "new_albums" RENAME TO "albums";
CREATE UNIQUE INDEX "albums_uuid_key" ON "albums"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
