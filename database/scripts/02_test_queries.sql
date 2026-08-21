USE identity_resolution_db;

SELECT
    p.person_id,
    p.full_name,
    i.identity_type,
    i.identity_value,
    i.verification_status
FROM persons AS p
JOIN identities AS i
    ON p.person_id = i.person_id
ORDER BY p.person_id, i.identity_id;
SELECT
    il.link_id,
    source_i.identity_value AS source_identity,
    target_i.identity_value AS target_identity,
    il.link_status,
    il.confidence_score,
    il.match_reason
FROM identity_links AS il
JOIN identities AS source_i
    ON il.source_identity_id = source_i.identity_id
JOIN identities AS target_i
    ON il.target_identity_id = target_i.identity_id;
SELECT
    i.identity_value,
    vr.verification_method,
    vr.verification_result,
    vr.remarks
FROM verification_records AS vr
JOIN identities AS i
    ON vr.identity_id = i.identity_id;
SELECT * FROM audit_logs;