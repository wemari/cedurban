SELECT
    cols.table_schema,
    cols.table_name,
    cols.column_name,
    cols.ordinal_position,
    cols.data_type,
    cols.character_maximum_length,
    cols.numeric_precision,
    cols.is_nullable,
    cols.column_default,
    
    -- Is Primary Key
    CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key,

    -- Is Foreign Key
    CASE WHEN fk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_foreign_key,
    
    -- FK Reference Table
    fk.foreign_table_name,
    fk.foreign_column_name

FROM information_schema.columns cols

-- Join for PK
LEFT JOIN (
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk
ON cols.table_schema = pk.table_schema
AND cols.table_name = pk.table_name
AND cols.column_name = pk.column_name

-- Join for FK
LEFT JOIN (
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk
ON cols.table_schema = fk.table_schema
AND cols.table_name = fk.table_name
AND cols.column_name = fk.column_name

WHERE cols.table_name = 'users'
  AND cols.table_schema = 'public'  -- adjust if needed

ORDER BY cols.ordinal_position;
