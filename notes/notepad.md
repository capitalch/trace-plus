# AI query
PostgreSql: I have following tables:
ProductM: id, catId, brandId, label
CategoryM: id, catName, isLeaf, parentId, tagId
BrandM: id, brandName
TagM: id, tagName
As evident the table CategoryM is hierarchical table having parentId and tagId can be associated at any level
Create query which takes input of catId, brandId, tagId. Only one of these is not null.
Query returns all the id's from ProductM which is associated with not null value of catId or brandId or tagId. If all are null then return all product id's
Note that if catId is not null it means all leaf categories for that category in hierarchical manner incorporating all associated product. Similarly for tagId

# Working query

WITH RECURSIVE 
    -- Parameter tables must be declared first
    "brandId" AS (VALUES (null::int)),
    "catId" AS (VALUES (1::int)),
    "tagId" AS (VALUES (null::int)),

    -- Recursive category tree from catId
    cat_tree AS (
        SELECT id, "isLeaf"
        FROM "CategoryM"
        WHERE id = (TABLE "catId")

        UNION ALL

        SELECT c.id, c."isLeaf"
        FROM "CategoryM" c
        JOIN cat_tree t ON c."parentId" = t.id
    ),

    leaf_categories_from_catId AS (
        SELECT id FROM cat_tree WHERE "isLeaf" = TRUE
    ),

    -- Recursive tag category tree
    tag_base AS (
        SELECT id, "isLeaf"
        FROM "CategoryM"
        WHERE "tagId" = (TABLE "tagId")
    ),
    
    tag_tree AS (
        SELECT id, "isLeaf"
        FROM tag_base

        UNION ALL

        SELECT c.id, c."isLeaf"
        FROM "CategoryM" c
        JOIN tag_tree t ON c."parentId" = t.id
    ),

    leaf_categories_from_tagId AS (
        SELECT id FROM tag_tree WHERE "isLeaf" = TRUE
    ),

    filtered_products AS (
        SELECT p.id
        FROM "ProductM" p
        WHERE
            -- Match by catId (expanded to leaf nodes)
            ((TABLE "catId") IS NOT NULL AND p."catId" IN (SELECT id FROM leaf_categories_from_catId))

            -- Match by brandId
            OR ((TABLE "brandId") IS NOT NULL AND p."brandId" = (TABLE "brandId"))

            -- Match by tagId (expanded to leaf nodes)
            OR ((TABLE "tagId") IS NOT NULL AND p."catId" IN (SELECT id FROM leaf_categories_from_tagId))

            -- If all are null, return everything
            OR ((TABLE "catId") IS NULL AND (TABLE "brandId") IS NULL AND (TABLE "tagId") IS NULL)
    )

SELECT DISTINCT id FROM filtered_products;