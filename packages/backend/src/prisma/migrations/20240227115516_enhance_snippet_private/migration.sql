-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_snippets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "parentUuid" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME
);
INSERT INTO "new_snippets" ("content", "createdAt", "description", "editedAt", "id", "identifier", "language", "name", "parentUuid", "userId", "uuid") SELECT "content", "createdAt", "description", "editedAt", "id", "identifier", "language", "name", "parentUuid", "userId", "uuid" FROM "snippets";
DROP TABLE "snippets";
ALTER TABLE "new_snippets" RENAME TO "snippets";
CREATE UNIQUE INDEX "snippets_uuid_key" ON "snippets"("uuid");
CREATE UNIQUE INDEX "snippets_identifier_key" ON "snippets"("identifier");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
