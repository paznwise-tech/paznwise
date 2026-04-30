-- SQL Migration to create the UserProfile table matching the provided Prisma model
-- This resolves the "relation does not exist" error while allowing the app to use raw SQL

CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  
  -- Name & Identity
  "name" TEXT,
  "username" TEXT,
  
  -- Bio & Description
  "bio" TEXT,
  "website" TEXT,
  
  -- Profile Picture
  "avatar" TEXT,
  
  -- Social Links (External)
  "instagram" TEXT,
  "tiktok" TEXT,
  "twitter" TEXT,
  "facebook" TEXT,
  "youtube" TEXT,
  "linkedin" TEXT,
  
  -- Location
  "city" TEXT,
  "country" TEXT,
  
  -- Artist/Brand Specifics
  "category" TEXT,
  "experience" TEXT,
  
  -- Status
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "isVerified" BOOLEAN DEFAULT false,
  
  -- Timestamps
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted" BOOLEAN NOT NULL DEFAULT false,

  -- Primary Key
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key to User table (assuming User table has id as primary key)
  CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint for userId since a user can only have one profile
CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_userId_key" ON "UserProfile"("userId");

-- Indexes mapped from the Prisma model
CREATE INDEX IF NOT EXISTS "UserProfile_userId_idx" ON "UserProfile"("userId");
CREATE INDEX IF NOT EXISTS "UserProfile_username_idx" ON "UserProfile"("username");
CREATE INDEX IF NOT EXISTS "UserProfile_category_idx" ON "UserProfile"("category");
