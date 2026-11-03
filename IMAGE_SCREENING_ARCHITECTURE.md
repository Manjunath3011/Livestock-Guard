# LivestockGuard: AI-Powered Image-Based Livestock Disease Screening Architecture

## 1. Executive Summary & Purpose

The **Livestock Image Intelligence Engine** is a modular computer-vision subsystem built for the LivestockGuard platform. It performs preliminary lesion detection and syndromic image screening for livestock diseases while adhering strictly to veterinary clinical boundaries, biosecurity protocols, and data-provenance integrity.

The engine evaluates photographs using **transfer learning** with pretrained convolutional neural networks (**EfficientNetB0** and **MobileNetV2**), operating as an independent modality alongside the existing 54-feature Random Forest tabular model, the epidemiological Weighted Sum Model (WSM) risk engine, and laboratory diagnostic workflows.

---

## 2. Pretrained Model Architecture Evaluation

Two foundational CNN architectures were systematically evaluated for rural livestock disease screening:

| Specification | EfficientNetB0 (Default Primary) | MobileNetV2 (Edge / Standby) |
| :--- | :--- | :--- |
| **Backbone Design** | Compound-scaled depth, width, resolution | Inverted residuals & linear bottlenecks |
| **Parameters (Backbone)** | 4.05 Million | 2.26 Million |
| **Parameters (With 11-Head)** | 5.29 Million | 3.49 Million |
| **FLOPs (Multiply-Accumulates)**| 0.39 GFLOPs | 0.30 GFLOPs |
| **Model Size (FP32)** | 20.8 MB | 13.9 MB |
| **Model Size (FP16 / TFLite)** | 10.5 MB | 7.0 MB |
| **Inference Latency (CPU)** | ~32.5 ms | ~18.2 ms |
| **Inference Latency (Mobile)** | ~45.0 ms | ~22.0 ms |
| **Top-1 ImageNet Accuracy** | 77.1% | 72.0% |
| **Lesion Acuity** | High (fine vesicle/scab texture sensitivity) | Moderate (good coarse contour recognition) |
| **Optimal Deployment** | Cloud / FastAPI Backend Service | Mobile app / Para-Vet edge devices |

### Custom Classification Head
The classification head replaces the default 1000-class ImageNet head:
1. `Input`: $(224 \times 224 \times 3)$ normalized RGB tensor.
2. `GlobalAveragePooling2D`: Spatial dimensionality reduction.
3. `BatchNormalization`: Stabilizes distribution shifts.
4. `Dropout(0.35)`: Prevents overfitting on dominant clinical backgrounds.
5. `Dense(256, ReLU)`: Intermediate projection manifold.
6. `BatchNormalization` + `Dropout(0.25)`: Secondary regularization.
7. `Dense(11, Softmax)`: Calibrated posterior distribution across the 11 target classes.

---

## 3. Scientific 11-Disease Visual Feasibility Taxonomy

Not all livestock diseases present with pathognomonic visual skin or mucosal lesions. In veterinary medicine, assuming every pathogen can be diagnosed from a photograph is medically negligent and scientifically incorrect. 

The 11 disease categories are strictly classified into diagnostic feasibility tiers:

| Disease Class | Scientific Name | Target Species | Visual Feasibility Tier | Lesion Profile | Diagnostic Safeguard & Lab Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. dis_fmd** | Aphthovirus | Cattle, Buffalo, Sheep, Goats, Pigs | `VISUAL_SCREENING_FEASIBLE` | Vesicles, erosions on dental pad, tongue, interdigital cleft | Antigen ELISA / RT-PCR on vesicular fluid flap |
| **2. dis_lsd** | Capripoxvirus | Cattle, Buffalo | `VISUAL_SCREENING_FEASIBLE` | Circumscribed raised nodules (2-5cm), sitfast scabs | Real-time PCR on skin scab biopsies |
| **3. dis_ppr** | Small Ruminant Morbillivirus | Goats, Sheep | `VISUAL_SCREENING_FEASIBLE` | Necrotic stomatitis, scabby crusted lips, purulent discharge | Competitive ELISA / RT-PCR |
| **4. dis_hs** | *Pasteurella multocida* | Buffalo, Cattle | `LABORATORY_CONFIRMATORY_REQUIRED` | Submandibular/brisket edema (mimics snakebite/anthrax) | Blood smear Leishman/Giemsa bipolar staining & PCR |
| **5. dis_anthrax** | *Bacillus anthracis* | All ruminants, Zoonotic | `STRICT_BIOHAZARD_LAB_REQUIRED` | Sudden death, dark unclotted blood from orifices | **BIOHAZARD:** Do NOT open carcass. Blood smear M'Fadyean capsule reaction / PCR |
| **6. dis_bq** | *Clostridium chauvoei* | Cattle, Sheep | `LABORATORY_CONFIRMATORY_REQUIRED` | Crepitating muscle swelling (requires physical palpation) | Direct FAT or PCR on muscular aspirates |
| **7. dis_brucellosis** | *Brucella abortus / melitensis* | Cattle, Buffalo, Sheep, Goats, Pigs | `LABORATORY_CONFIRMATORY_REQUIRED` | Late-term abortion, hygroma, orchitis (photos non-diagnostic) | Rose Bengal Plate Test (RBPT) / Milk Ring Test / ELISA |
| **8. dis_mastitis** | *S. aureus, Streptococcus, E. coli* | Cattle, Buffalo, Goats | `VISUAL_SCREENING_FEASIBLE` | Swollen udder quarter, clots/flakes in strip-cup milk | California Mastitis Test (CMT) & microbial culture |
| **9. dis_asf** | African swine fever virus | Domestic & wild pigs | `SYNDROMIC_SUSPICION_LAB_MANDATORY` | Cutaneous cyanosis/erythema on ears/abdomen | PCR / ELISA mandatory (mimics Classical Swine Fever) |
| **10. dis_avian_flu** | Influenza A virus | Poultry | `SYNDROMIC_SUSPICION_LAB_MANDATORY` | Comb/wattle cyanosis, head edema, shanks ecchymosis | RT-PCR / HI Test mandatory (mimics Newcastle Disease) |
| **11. dis_other_healthy**| Baseline / Non-infectious | All livestock | `VISUAL_SCREENING_FEASIBLE` | Normal posture, clear mucous membranes, smooth coat | Routine physical inspection |

---

## 4. Dataset Ingestion, Provenance & Leakage Prevention

### Permissible External Data Sources
- **Kaggle**: Cattle Disease Dataset V2, FMD Cattle Dataset, Lumpy Skin Disease Archive.
- **Government & Veterinary Institutions**: ICAR-NIVEDI clinical lesion database, WOAH WAHIS surveillance reports, State Animal Disease Diagnostic Laboratories.
- **Licensing Requirements**: Strict enforcement of `CC-BY-4.0`, `CC0-1.0`, `ODC-By`, or `Academic-Research-Use`. Commercial or unverified scrapings are rejected.

### Quality and Anti-Leakage Controls
1. **Bitwise & Perceptual Deduplication**:
   - Computes SHA-256 and perceptual difference hashes.
   - Rejects identical or near-duplicate frames from the same photographic burst.
2. **Animal & Farm Aware Partitioning**:
   - Samples are grouped by `animal_id` or `farm_id`.
   - Images of the same animal are strictly isolated to **either** the train set or the test set—never split across both.
3. **Domain & Feature Sanitization**:
   - EXIF location tags and timestamps are sanitized to prevent background or GPS shortcuts.
   - Images with non-livestock objects, extreme blur, or overexposure are filtered out during ingestion.

---

## 5. Transfer Learning Training Pipeline

Training executes in two distinct phases:

```
Phase 1: Classification Head Warm-up
   ┌───────────────────────┐
   │  Frozen Base CNN      │  (ImageNet weights frozen)
   └──────────┬────────────┘
              ▼
   ┌───────────────────────┐
   │ Classification Head   │  (Trained with Adam, lr = 1e-3, 15 epochs)
   └───────────────────────┘

Phase 2: Fine-Tuning Top Backbone Layers
   ┌───────────────────────┐
   │ Top 30 Backbone Layers│  (Unfrozen, fine-tuned with lr = 1e-5, 20 epochs)
   └──────────┬────────────┘
              ▼
   ┌───────────────────────┐
   │ Classification Head   │  (Jointly optimized with EarlyStopping & Checkpoints)
   └───────────────────────┘
```

### Epidemiological Class Weighting
To counteract severe class imbalance (e.g. rare Anthrax cases vs abundant common mastitis or healthy animals), inverse class frequency weights are computed:
$$w_c = \frac{N_{\text{total}}}{K \cdot N_c}$$

### Probability Calibration
Raw Softmax scores are not treated as calibrated posterior probabilities. Platt scaling / temperature scaling parameters are optimized on held-out validation data:
$$\hat{p}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

---

## 6. Uncertainty Estimation & Rejection Mechanism

The system automatically rejects ambiguous or out-of-domain images using three criteria:
1. **Top-1 Confidence Cut-off**: Calibrated probability $< 0.65$.
2. **Top-2 Decision Margin**: Difference between the top prediction and second candidate $< 0.15$.
3. **Normalized Shannon Entropy**:
   $$H_{\text{norm}}(\mathbf{p}) = \frac{-\sum_{k=1}^{K} p_k \log_2(p_k)}{\log_2(K)} > 0.70$$

When triggered, the system returns:
> *"Unable to provide a reliable image screening result. Veterinary examination is recommended."*

---

## 7. Hybrid Decision Fusion: Multimodal Coordination

The platform preserves a strict separation between data modalities:
- **Tabular ML Model**: 54 structured epidemiological features processed via Random Forest.
- **Image Intelligence Engine**: Visual lesion features processed via EfficientNetB0 / MobileNetV2.
- **Contextual Risk Engine**: Proximity to outbreaks, herd attack rate, mortality velocity, vaccination gap.
- **Definitive Diagnosis**: Laboratory RT-PCR, ELISA, or bacterial culture.

**Crucial Coordination Principle**:
- Visual confidence scores and tabular Random Forest probabilities are **never simply averaged**.
- Multimodal agreement (e.g. skin nodule image + bovine fever symptoms both pointing to LSD) elevates the composite confidence and generates explainable attribution factors.
- An image screening result **never overrides** a confirmed laboratory result.

---

## 8. FastAPI Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/image-screening/health` | Returns service status and loaded model architecture. |
| `GET` | `/api/image-screening/model-status` | Returns active model version, parameters, and training status (`MODEL_NOT_READY` vs `READY`). |
| `GET` | `/api/image-screening/supported-classes` | Returns the complete 11-disease taxonomy with visual feasibility tiers. |
| `POST`| `/api/image-screening/validate` | Validates image bytes for MIME type, dimensions, sharpness, and exposure. |
| `POST`| `/api/image-screening/predict` | Executes screening with species validation and uncertainty rejection safeguards. |

---

## 9. Deployment Instructions

### Local / Development Mode
1. Install Python dependencies:
   ```bash
   pip install -r ml_image_service/requirements.txt
   ```
2. Start the FastAPI microservice:
   ```bash
   uvicorn ml_image_service.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. Run the unit and API test suite:
   ```bash
   pytest ml_image_service/tests/test_api.py -v
   ```

### Docker Container Deployment
```bash
docker build -t livestockguard-image-service -f ml_image_service/Dockerfile .
docker run -p 8000:8000 --env IMAGE_MODEL_ARCH=EfficientNetB0 livestockguard-image-service
```
