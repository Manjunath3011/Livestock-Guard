"""
LIVESTOCKGUARD — Unit & API Tests for Image Intelligence Engine
Tests endpoints: health, supported-classes, model-status, validate, and predict.
"""

from fastapi.testclient import TestClient
import io
from PIL import Image
import pytest
from main import app, DISEASE_TAXONOMY

client = TestClient(app)

def create_dummy_image_bytes(width=256, height=256, color=(128, 128, 128), fmt="JPEG") -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()

def test_health_endpoint():
    response = client.get("/api/image-screening/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "model_readiness" in data

def test_model_status_endpoint():
    response = client.get("/api/image-screening/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert "supportedVisualClasses" in data
    assert len(data["supportedVisualClasses"]) > 0

def test_supported_classes_taxonomy():
    response = client.get("/api/image-screening/supported-classes")
    assert response.status_code == 200
    data = response.json()
    assert data["totalClasses"] == 11
    assert "dis_fmd" in data["classes"]
    assert "dis_anthrax" in data["classes"]
    # Check that Anthrax has strict biohazard requirement
    assert data["classes"]["dis_anthrax"]["visual_feasibility"] == "STRICT_BIOHAZARD_LAB_REQUIRED"

def test_validate_valid_image():
    img_bytes = create_dummy_image_bytes(300, 300)
    response = client.post(
        "/api/image-screening/validate",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isValid"] is True
    assert data["qualityStatus"] == "GOOD"

def test_validate_corrupted_empty_image():
    empty_bytes = b"not-a-real-image"
    response = client.post(
        "/api/image-screening/validate",
        files={"file": ("corrupt.jpg", empty_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isValid"] is False

def test_predict_endpoint_model_not_ready():
    img_bytes = create_dummy_image_bytes(300, 300)
    response = client.post(
        "/api/image-screening/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        data={"species": "CATTLE", "case_id": "cas_test_001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # When weights are not yet deployed, returns MODEL_NOT_READY honestly
    assert data["status"] in ["MODEL_NOT_READY", "SCREENING_COMPLETED"]
