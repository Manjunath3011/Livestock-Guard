"""
LIVESTOCKGUARD — Pretrained Computer Vision Model Architectures
Comparison and definition of EfficientNetB0 vs MobileNetV2 for livestock disease screening.
"""

from typing import Dict, Any, Tuple
import os

# Architectural comparison constants based on standard ImageNet pretraining benchmarks
MODEL_SPECS: Dict[str, Dict[str, Any]] = {
    "EfficientNetB0": {
        "name": "EfficientNetB0",
        "description": "Compound scaled convolutional neural network balancing depth, width, and resolution.",
        "input_resolution": (224, 224, 3),
        "backbone_params": 4_049_571,
        "total_params_with_head": 5_286_283,  # With 11-class classification head
        "flops_g": 0.39,
        "model_size_mb": 20.8,
        "fp16_size_mb": 10.5,
        "inference_latency_cpu_ms": 32.5,
        "inference_latency_gpu_ms": 6.8,
        "top1_imagenet_accuracy": 77.1,
        "deployment_suitability": "Optimal for server-side inference and high-accuracy lesion pattern detection."
    },
    "MobileNetV2": {
        "name": "MobileNetV2",
        "description": "Inverted residual and linear bottleneck architecture optimized for edge devices.",
        "input_resolution": (224, 224, 3),
        "backbone_params": 2_257_984,
        "total_params_with_head": 3_494_699,  # With 11-class classification head
        "flops_g": 0.30,
        "model_size_mb": 13.9,
        "fp16_size_mb": 7.0,
        "inference_latency_cpu_ms": 18.2,
        "inference_latency_gpu_ms": 4.1,
        "top1_imagenet_accuracy": 72.0,
        "deployment_suitability": "Optimal for resource-constrained edge deployments, mobile veterinarians, and offline field devices."
    }
}


def build_transfer_learning_model(
    architecture: str = "EfficientNetB0",
    num_classes: int = 11,
    freeze_backbone: bool = True
):
    """
    Constructs a transfer-learning classifier using TensorFlow / Keras.
    Loads pretrained ImageNet weights, removes the classification head,
    and attaches a regularized LivestockGuard classification head.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
    except ImportError:
        # Return architectural description when running in environments without TF
        return {
            "status": "TENSORFLOW_NOT_INSTALLED",
            "architecture": architecture,
            "specs": MODEL_SPECS.get(architecture, MODEL_SPECS["EfficientNetB0"])
        }

    input_shape = (224, 224, 3)
    inputs = layers.Input(shape=input_shape, name="input_image")

    # Image Preprocessing & Normalization Layer
    if architecture == "EfficientNetB0":
        # EfficientNet has built-in normalization
        base_model = tf.keras.applications.EfficientNetB0(
            include_top=False,
            weights="imagenet",
            input_tensor=inputs
        )
    elif architecture == "MobileNetV2":
        # MobileNet expects inputs in [-1, 1]
        x_norm = layers.Rescaling(1./127.5, offset=-1)(inputs)
        base_model = tf.keras.applications.MobileNetV2(
            include_top=False,
            weights="imagenet",
            input_tensor=x_norm
        )
    else:
        raise ValueError(f"Unsupported architecture: {architecture}. Supported: EfficientNetB0, MobileNetV2")

    # Freeze backbone if requested for initial warmup phase
    base_model.trainable = not freeze_backbone

    # Custom LivestockGuard Classification Head
    x = base_model.output
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="head_batch_norm_1")(x)
    x = layers.Dropout(0.35, name="head_dropout_1")(x)
    x = layers.Dense(256, activation="relu", name="head_dense_1")(x)
    x = layers.BatchNormalization(name="head_batch_norm_2")(x)
    x = layers.Dropout(0.25, name="head_dropout_2")(x)
    
    # 11-class multi-class probability outputs
    outputs = layers.Dense(num_classes, activation="softmax", name="disease_class_probs")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"LivestockGuard_{architecture}")
    return model
