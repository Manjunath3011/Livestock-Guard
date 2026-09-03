import L from 'leaflet';

/**
 * Leaflet Heatmap Helper
 * Safely initializes and provides real geographic density heatmaps
 * for LivestockGuard disease surveillance without external API dependencies.
 */
export async function createHeatmapLayer(
  points: [number, number, number][], // [lat, lng, weight/intensity]
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
  }
): Promise<L.Layer | null> {
  if (typeof window === 'undefined' || points.length === 0) return null;

  try {
    // Ensure Leaflet global is accessible for leaflet.heat plugin
    (window as any).L = L;
    await import('leaflet.heat');

    if (typeof (L as any).heatLayer === 'function') {
      const heat = (L as any).heatLayer(points, {
        radius: options?.radius ?? 24,
        blur: options?.blur ?? 16,
        maxZoom: options?.maxZoom ?? 13,
        max: options?.max ?? 1.0,
        gradient: {
          0.2: '#10b981', // Mild/Low risk density (Green)
          0.45: '#eab308', // Moderate risk density (Amber)
          0.7: '#f97316', // High risk density (Orange)
          0.95: '#ef4444' // Critical epidemic density (Red)
        }
      });
      return heat;
    }
  } catch (err) {
    console.warn('Leaflet heat plugin fallback notice:', err);
  }

  // Graceful Canvas / Circle density fallback if plugin unavailable
  const fallbackGroup = L.layerGroup();
  points.forEach(([lat, lng, weight]) => {
    const color =
      weight > 0.75
        ? '#ef4444'
        : weight > 0.45
        ? '#f97316'
        : weight > 0.25
        ? '#eab308'
        : '#10b981';

    const circle = L.circle([lat, lng], {
      radius: Math.max(3000, weight * 12000), // meters
      fillColor: color,
      fillOpacity: Math.min(0.4, Math.max(0.12, weight * 0.35)),
      color: 'transparent',
      weight: 0,
      interactive: false
    });
    fallbackGroup.addLayer(circle);
  });

  return fallbackGroup;
}
