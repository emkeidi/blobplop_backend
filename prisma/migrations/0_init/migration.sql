-- CreateTable
CREATE TABLE "mc_stat" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "stats" JSONB,

    CONSTRAINT "mc_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mc_stats_id_key" ON "mc_stat"("id");

-- CreateIndex
CREATE UNIQUE INDEX "mc_stats_user_id_key" ON "mc_stat"("user_id");

