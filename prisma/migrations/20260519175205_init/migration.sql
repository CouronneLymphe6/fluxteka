-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "github_url" TEXT,
    "website_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'buyer',
    "stripe_account_id" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description_fr" TEXT NOT NULL,
    "description_en" TEXT,
    "description_es" TEXT,
    "description_de" TEXT,
    "description_it" TEXT,
    "how_to_use" TEXT,
    "prerequisites" TEXT,
    "tool" TEXT NOT NULL,
    "tools_connected" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "source_url" TEXT,
    "source_type" TEXT,
    "source_stars" INTEGER NOT NULL DEFAULT 0,
    "source_views" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT NOT NULL,
    "score_total" REAL NOT NULL DEFAULT 5,
    "score_users" REAL NOT NULL DEFAULT 5,
    "score_popularity" REAL NOT NULL DEFAULT 5,
    "score_freshness" REAL NOT NULL DEFAULT 10,
    "score_reports" REAL NOT NULL DEFAULT 10,
    "verified_at" DATETIME,
    "last_checked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "file_url" TEXT,
    "thumbnail_url" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "indexing_source" TEXT,
    "raw_content" TEXT,
    "duplicate_of" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Workflow_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "stripe_payment_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "seller_amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Purchase_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedWorkflow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedWorkflow_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool" TEXT NOT NULL,
    "workflow_id" TEXT,
    "user_id" TEXT,
    "ip_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PipelineLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "run_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "found" INTEGER NOT NULL DEFAULT 0,
    "new" INTEGER NOT NULL DEFAULT 0,
    "duplicates_url" INTEGER NOT NULL DEFAULT 0,
    "duplicates_content" INTEGER NOT NULL DEFAULT 0,
    "duplicates_title" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "error_detail" TEXT,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "estimated_cost_usd" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CrawledUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "url_normalized" TEXT NOT NULL,
    "content_fingerprint" TEXT,
    "source" TEXT NOT NULL,
    "workflow_id" TEXT,
    "crawled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'indexed'
);

-- CreateTable
CREATE TABLE "SmokeTestLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "website" TEXT,
    "message" TEXT,
    "budget" TEXT,
    "tool" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_slug_key" ON "Workflow"("slug");

-- CreateIndex
CREATE INDEX "Workflow_slug_idx" ON "Workflow"("slug");

-- CreateIndex
CREATE INDEX "Workflow_tool_idx" ON "Workflow"("tool");

-- CreateIndex
CREATE INDEX "Workflow_category_idx" ON "Workflow"("category");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE INDEX "Workflow_score_total_idx" ON "Workflow"("score_total");

-- CreateIndex
CREATE INDEX "Workflow_created_at_idx" ON "Workflow"("created_at");

-- CreateIndex
CREATE INDEX "Workflow_source_url_idx" ON "Workflow"("source_url");

-- CreateIndex
CREATE INDEX "Workflow_indexing_source_idx" ON "Workflow"("indexing_source");

-- CreateIndex
CREATE INDEX "Review_workflow_id_idx" ON "Review"("workflow_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_workflow_id_user_id_key" ON "Review"("workflow_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripe_payment_id_key" ON "Purchase"("stripe_payment_id");

-- CreateIndex
CREATE INDEX "Purchase_buyer_id_idx" ON "Purchase"("buyer_id");

-- CreateIndex
CREATE INDEX "Purchase_workflow_id_idx" ON "Purchase"("workflow_id");

-- CreateIndex
CREATE INDEX "SavedWorkflow_user_id_idx" ON "SavedWorkflow"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedWorkflow_user_id_workflow_id_key" ON "SavedWorkflow"("user_id", "workflow_id");

-- CreateIndex
CREATE INDEX "Report_workflow_id_idx" ON "Report"("workflow_id");

-- CreateIndex
CREATE INDEX "Report_resolved_idx" ON "Report"("resolved");

-- CreateIndex
CREATE INDEX "AffiliateClick_tool_idx" ON "AffiliateClick"("tool");

-- CreateIndex
CREATE INDEX "AffiliateClick_created_at_idx" ON "AffiliateClick"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateLink_tool_key" ON "AffiliateLink"("tool");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerSubscription_agency_id_key" ON "PartnerSubscription"("agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerSubscription_stripe_subscription_id_key" ON "PartnerSubscription"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "PipelineLog_source_idx" ON "PipelineLog"("source");

-- CreateIndex
CREATE INDEX "PipelineLog_run_at_idx" ON "PipelineLog"("run_at");

-- CreateIndex
CREATE UNIQUE INDEX "CrawledUrl_url_key" ON "CrawledUrl"("url");

-- CreateIndex
CREATE UNIQUE INDEX "CrawledUrl_url_normalized_key" ON "CrawledUrl"("url_normalized");

-- CreateIndex
CREATE INDEX "CrawledUrl_url_idx" ON "CrawledUrl"("url");

-- CreateIndex
CREATE INDEX "CrawledUrl_url_normalized_idx" ON "CrawledUrl"("url_normalized");

-- CreateIndex
CREATE INDEX "CrawledUrl_content_fingerprint_idx" ON "CrawledUrl"("content_fingerprint");

-- CreateIndex
CREATE INDEX "CrawledUrl_source_idx" ON "CrawledUrl"("source");

-- CreateIndex
CREATE INDEX "CrawledUrl_crawled_at_idx" ON "CrawledUrl"("crawled_at");

-- CreateIndex
CREATE INDEX "SmokeTestLead_type_idx" ON "SmokeTestLead"("type");

-- CreateIndex
CREATE INDEX "SmokeTestLead_email_idx" ON "SmokeTestLead"("email");

-- CreateIndex
CREATE INDEX "SmokeTestLead_created_at_idx" ON "SmokeTestLead"("created_at");
