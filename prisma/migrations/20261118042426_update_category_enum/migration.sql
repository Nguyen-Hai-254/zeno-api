-- Chuyển từ bảng danh mục sang enum Category mà không làm mất loại của sản phẩm/nhóm đặc tính.
-- COMPUTER và PERIPHERAL cần ánh xạ thủ công vì không tương ứng duy nhất với enum mới.
BEGIN;

CREATE TYPE "Category_new" AS ENUM ('PHONE', 'TABLET', 'LAPTOP', 'SMART_WATCH', 'DESKTOP', 'MONITOR', 'ACCESSORY');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "products" AS p
    JOIN "product_categories" AS c ON c."id" = p."categoryId"
    WHERE c."category"::text IN ('COMPUTER', 'PERIPHERAL')
  ) OR EXISTS (
    SELECT 1
    FROM "attribute_groups" AS g
    JOIN "product_categories" AS c ON c."id" = g."categoryId"
    WHERE c."category"::text IN ('COMPUTER', 'PERIPHERAL')
  ) THEN
    RAISE EXCEPTION 'Cần ánh xạ dữ liệu COMPUTER/PERIPHERAL sang enum Category mới trước khi chạy migration';
  END IF;
END
$$;

ALTER TABLE "products" ADD COLUMN "category_new" "Category_new";
ALTER TABLE "attribute_groups" ADD COLUMN "category_new" "Category_new";

UPDATE "products" AS p
SET "category_new" = c."category"::text::"Category_new"
FROM "product_categories" AS c
WHERE p."categoryId" = c."id";

UPDATE "attribute_groups" AS g
SET "category_new" = c."category"::text::"Category_new"
FROM "product_categories" AS c
WHERE g."categoryId" = c."id";

ALTER TABLE "products" ALTER COLUMN "category_new" SET NOT NULL;
ALTER TABLE "attribute_groups" ALTER COLUMN "category_new" SET NOT NULL;

ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";
ALTER TABLE "attribute_groups" DROP CONSTRAINT "attribute_groups_categoryId_fkey";

DROP INDEX "products_categoryId_idx";
DROP INDEX "attribute_groups_categoryId_code_key";
DROP INDEX "attribute_groups_categoryId_sortOrder_idx";

ALTER TABLE "products" DROP COLUMN "categoryId";
ALTER TABLE "attribute_groups" DROP COLUMN "categoryId";

ALTER TABLE "products" RENAME COLUMN "category_new" TO "category";
ALTER TABLE "attribute_groups" RENAME COLUMN "category_new" TO "category";

DROP TABLE "product_categories";
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";

CREATE INDEX "products_category_idx" ON "products"("category");
CREATE UNIQUE INDEX "attribute_groups_category_code_key" ON "attribute_groups"("category", "code");
CREATE INDEX "attribute_groups_category_sortOrder_idx" ON "attribute_groups"("category", "sortOrder");

COMMIT;
