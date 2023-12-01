/*
  Warnings:

  - Changed the type of `user_id` on the `mc_stat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "mc_stat" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "mc_stats_user_id_key" ON "mc_stat"("user_id");
