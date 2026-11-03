"""
LIVESTOCKGUARD — Dataset Management & Ingestion Pipeline
Handles legitimate source ingestion, provenance tracking, duplicate detection,
and animal/farm-aware splitting to prevent train-test data leakage.
"""

import os
import json
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict

# Target 11-Class Disease Schema
TARGET_CLASSES = [
    "dis_fmd",
    "dis_lsd",
    "dis_ppr",
    "dis_hs",
    "dis_anthrax",
    "dis_bq",
    "dis_brucellosis",
    "dis_mastitis",
    "dis_asf",
    "dis_avian_flu",
    "dis_other_healthy"
]

@dataclass
class ImageSampleMetadata:
    sample_id: str
    image_path: str
    sha256_hash: str
    disease_label: str
    mapped_target_class: Optional[str]
    species: str
    animal_id: Optional[str]
    farm_id: Optional[str]
    source_name: str
    source_organization: str
    source_url: Optional[str]
    license_type: str
    collection_date: Optional[str]
    is_lab_confirmed: bool
    confirmation_method: Optional[str]
    image_width: int
    image_height: int
    quality_status: str  # 'GOOD', 'BLURRY', 'UNDEREXPOSED', 'OVEREXPOSED'
    is_duplicate: bool = False
    duplicate_of_id: Optional[str] = None

class LivestockDatasetValidator:
    """
    Validates external datasets (Kaggle, ICAR, university repositories)
    enforcing licence verification, label alignment, duplicate prevention, and zero leakage.
    """

    ALLOWED_LICENSES = [
        "CC-BY-4.0",
        "CC-BY-SA-4.0",
        "CC0-1.0",
        "Open-Data-Commons-ODC-By",
        "MIT",
        "Government-Open-Data-License-India",
        "Academic-Research-Use-Permitted"
    ]

    def __init__(self, catalog_path: Optional[str] = None):
        self.catalog_path = catalog_path or "ml_image_service/dataset_catalog.json"
        self.samples: List[ImageSampleMetadata] = []
        self.seen_hashes: Dict[str, str] = {}  # sha256 -> sample_id

    def compute_sha256(self, file_path: str) -> str:
        """Computes SHA-256 for bitwise duplicate detection."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    def validate_sample(
        self,
        image_path: str,
        disease_label: str,
        species: str,
        source_name: str,
        license_type: str,
        is_lab_confirmed: bool = False,
        animal_id: Optional[str] = None,
        farm_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str], Optional[ImageSampleMetadata]]:
        """
        Validates individual image sample before inclusion in training/evaluation manifests.
        """
        if not os.path.exists(image_path):
            return False, f"File does not exist: {image_path}", None

        if license_type not in self.ALLOWED_LICENSES:
            return False, f"Unverified or non-permissive license: {license_type}. Permitted: {self.ALLOWED_LICENSES}", None

        # Bitwise duplicate check
        img_hash = self.compute_sha256(image_path)
        if img_hash in self.seen_hashes:
            return False, f"Duplicate image detected! Matches existing sample ID: {self.seen_hashes[img_hash]}", None

        # Disease label mapping check
        mapped_class = disease_label if disease_label in TARGET_CLASSES else None
        if not mapped_class:
            return False, f"Disease label '{disease_label}' is unmapped in 11-class taxonomy. Preserving original but excluding from 11-class training.", None

        sample_id = f"smp_{len(self.samples) + 1:05d}_{img_hash[:8]}"
        self.seen_hashes[img_hash] = sample_id

        # Basic image dimension check
        width, height = 224, 224  # Default fallback or query with PIL if available
        try:
            from PIL import Image
            with Image.open(image_path) as img:
                width, height = img.size
        except Exception:
            pass

        sample = ImageSampleMetadata(
            sample_id=sample_id,
            image_path=image_path,
            sha256_hash=img_hash,
            disease_label=disease_label,
            mapped_target_class=mapped_class,
            species=species,
            animal_id=animal_id,
            farm_id=farm_id,
            source_name=source_name,
            source_organization=source_name,
            source_url=None,
            license_type=license_type,
            collection_date=None,
            is_lab_confirmed=is_lab_confirmed,
            confirmation_method="PCR_OR_ELISA" if is_lab_confirmed else None,
            image_width=width,
            image_height=height,
            quality_status="GOOD" if width >= 200 and height >= 200 else "LOW_RESOLUTION"
        )
        self.samples.append(sample)
        return True, None, sample

    def split_dataset_leakage_free(
        self,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Dict[str, List[ImageSampleMetadata]]:
        """
        Partitions samples into train, validation, and test splits.
        Crucially groups by animal_id or farm_id whenever available
        so images of the same animal are NEVER split across train and test!
        """
        import random
        random.seed(42)

        # Group by grouping key (farm_id or animal_id or sample_id)
        groups: Dict[str, List[ImageSampleMetadata]] = {}
        for s in self.samples:
            group_key = s.farm_id or s.animal_id or s.sample_id
            groups.setdefault(group_key, []).append(s)

        group_keys = list(groups.keys())
        random.shuffle(group_keys)

        n_total = len(group_keys)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        train_keys = set(group_keys[:n_train])
        val_keys = set(group_keys[n_train:n_train + n_val])
        test_keys = set(group_keys[n_train + n_val:])

        splits: Dict[str, List[ImageSampleMetadata]] = {
            "train": [s for k in train_keys for s in groups[k]],
            "val": [s for k in val_keys for s in groups[k]],
            "test": [s for k in test_keys for s in groups[k]],
        }
        return splits
