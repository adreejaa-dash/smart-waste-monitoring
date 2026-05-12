import { useEffect, useRef } from "react";

interface WasteReport {
  id: string;
  latitude: number;
  longitude: number;
  priority: string;
  wasteType: string;
  citizenName: string;
  location: string;
}

interface WasteMapProps {
  reports: WasteReport[];
}

export default function WasteMap({ reports }: WasteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const markersLayerRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([20.2961, 85.8245], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    reports.forEach(report => {
      const color = report.priority === 'High' ? 'red' : 
                   report.priority === 'Medium' ? 'orange' : 'green';
      
      const marker = L.circleMarker([report.latitude, report.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        radius: 8
      });
      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold">${report.wasteType}</h3>
          <p class="text-sm">Reporter: ${report.citizenName}</p>
          <p class="text-sm">Location: ${report.location}</p>
          <p class="text-sm">Priority: ${report.priority}</p>
        </div>
      `);

      markersLayerRef.current.addLayer(marker);
    });
  }, [reports]);

  const stats = {
    highPriority: reports.filter(r => r.priority === 'High').length,
    mediumPriority: reports.filter(r => r.priority === 'Medium').length,
    lowPriority: reports.filter(r => r.priority === 'Low').length,
  };

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="h-80 w-full rounded-lg bg-muted"
        data-testid="map-container"
      />
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="text-lg font-semibold text-destructive" data-testid="text-high-priority">
            {stats.highPriority}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Medium Priority</p>
          <p className="text-lg font-semibold text-accent" data-testid="text-medium-priority">
            {stats.mediumPriority}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Low Priority</p>
          <p className="text-lg font-semibold text-primary" data-testid="text-low-priority">
            {stats.lowPriority}
          </p>
        </div>
      </div>
    </div>
  );
}
