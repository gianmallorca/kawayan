import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import '@/lib/leafletIconFix';

type Props = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  centerHint?: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
  className?: string;
};

function MapViewSync({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({
  position,
  onPick,
}: {
  position: [number, number];
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onPick(lat, lng);
        },
      }}
    />
  );
}

export function LocationMapPicker({ latitude, longitude, centerHint, onPick, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const [marker, setMarker] = useState<[number, number] | null>(() =>
    latitude != null && longitude != null ? [latitude, longitude] : null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMarker([latitude, longitude]);
    }
  }, [latitude, longitude]);

  if (!mounted) {
    return <div className={`bg-gray-100 rounded-lg ${className ?? ''}`} style={{ minHeight: 280 }} />;
  }

  const center = marker ?? centerHint ?? [12.8797, 121.774];
  const zoom = marker ? 15 : centerHint ? 13 : 6;

  const handlePick = (lat: number, lng: number) => {
    setMarker([lat, lng]);
    onPick(lat, lng);
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 280, borderRadius: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewSync center={center} zoom={zoom} />
      <MapClickHandler onPick={handlePick} />
      {marker ? <DraggableMarker position={marker} onPick={handlePick} /> : null}
    </MapContainer>
  );
}
