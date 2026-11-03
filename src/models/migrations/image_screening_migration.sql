-- ==============================================================================
-- LIVESTOCKGUARD — PostgreSQL / Supabase Migration Design
-- Migration: 20261103_image_screening_and_model_registry.sql
-- Description: Schema and Row-Level Security (RLS) for AI Image Screening & Registry
-- ==============================================================================

-- 1. Create Enumerated Types
CREATE TYPE image_screening_status_type AS ENUM (
    'MODEL_NOT_READY',
    'TRAINING_PENDING',
    'READY',
    'SCREENING_COMPLETED',
    'LOW_CONFIDENCE_REJECTED',
    'NON_VISUAL_DISEASE_WARNING',
    'INSUFFICIENT_VISUAL_EVIDENCE',
    'UNSUPPORTED_SPECIES',
    'IMAGE_QUALITY_DEFECT'
);

CREATE TYPE image_quality_status_type AS ENUM (
    'GOOD',
    'BLURRY',
    'UNDEREXPOSED',
    'OVEREXPOSED',
    'LOW_RESOLUTION',
    'POOR'
);

CREATE TYPE vet_review_status_type AS ENUM (
    'PENDING',
    'AGREED',
    'DISAGREED',
    'INCONCLUSIVE',
    'LAB_CONFIRMATION_ORDERED'
);

CREATE TYPE cv_architecture_type AS ENUM (
    'EfficientNetB0',
    'MobileNetV2'
);

-- 2. Image Model Registry Table
CREATE TABLE IF NOT EXISTS image_model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(120) NOT NULL,
    model_version VARCHAR(32) NOT NULL UNIQUE,
    architecture cv_architecture_type NOT NULL,
    dataset_version VARCHAR(64) NOT NULL,
    evaluation_status VARCHAR(64) NOT NULL DEFAULT 'TRAINING_PENDING',
    model_artifact_location TEXT NOT NULL,
    total_parameters INTEGER NOT NULL,
    model_size_bytes BIGINT NOT NULL,
    inference_time_ms INTEGER NOT NULL,
    input_resolution JSONB NOT NULL DEFAULT '[224, 224, 3]',
    supported_visual_classes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    non_visual_classes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    metrics JSONB DEFAULT NULL,
    provenance JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Image Screenings Table
CREATE TABLE IF NOT EXISTS image_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE SET NULL,
    animal_id VARCHAR(64) REFERENCES animals(id) ON DELETE SET NULL,
    image_storage_path TEXT NOT NULL,
    thumbnail_storage_path TEXT,
    species VARCHAR(32) NOT NULL,
    predicted_class VARCHAR(64),
    confidence_score NUMERIC(5, 2), -- 0.00 to 100.00
    raw_softmax_score NUMERIC(6, 5), -- 0.00000 to 1.00000
    uncertainty_score NUMERIC(6, 5),
    is_rejected_due_to_uncertainty BOOLEAN DEFAULT FALSE,
    screening_status image_screening_status_type NOT NULL DEFAULT 'MODEL_NOT_READY',
    model_version VARCHAR(32) NOT NULL,
    model_architecture cv_architecture_type NOT NULL,
    image_quality_status image_quality_status_type NOT NULL DEFAULT 'GOOD',
    veterinarian_review_status vet_review_status_type NOT NULL DEFAULT 'PENDING',
    veterinarian_notes TEXT,
    veterinarian_reviewed_by VARCHAR(120),
    veterinarian_reviewed_at TIMESTAMPTZ,
    limitations_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendation TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indices for Fast Spatial and Entity Filtering
CREATE INDEX IF NOT EXISTS idx_image_screenings_case ON image_screenings(case_id);
CREATE INDEX IF NOT EXISTS idx_image_screenings_animal ON image_screenings(animal_id);
CREATE INDEX IF NOT EXISTS idx_image_screenings_species ON image_screenings(species);
CREATE INDEX IF NOT EXISTS idx_image_screenings_status ON image_screenings(screening_status);
CREATE INDEX IF NOT EXISTS idx_image_screenings_created ON image_screenings(created_at DESC);

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE image_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_model_registry ENABLE ROW LEVEL SECURITY;

-- Model Registry: Readable by authenticated staff, writable only by SYSTEM_ADMIN
CREATE POLICY model_registry_select_policy ON image_model_registry
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY model_registry_admin_policy ON image_model_registry
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN')
    WITH CHECK (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN');

-- Image Screenings:
-- Farmers can view and insert screenings for their own animals/farms
CREATE POLICY farmer_select_screenings ON image_screenings
    FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'FARMER' AND
        animal_id IN (SELECT id FROM animals WHERE owner_id = auth.uid()::text)
    );

CREATE POLICY farmer_insert_screenings ON image_screenings
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'FARMER' AND
        animal_id IN (SELECT id FROM animals WHERE owner_id = auth.uid()::text)
    );

-- Veterinarians & Field Workers: Can view and update screenings within assigned jurisdictions
CREATE POLICY vet_view_and_review ON image_screenings
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'))
    WITH CHECK (auth.jwt() ->> 'role' IN ('VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'));
