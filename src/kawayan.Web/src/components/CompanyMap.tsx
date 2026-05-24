import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type Props = {
  latitude: number;
  longitude: number;
  label: string;
  zoom?: number;
  className?: string;
};

export function CompanyMap({ latitude, longitude, label, zoom = 15, className }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[280px] md:min-h-[400px] bg-gray-100 rounded-lg" />;
  }

  return (
    <MapContainer
      key={`${latitude}-${longitude}`}
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 280, borderRadius: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}

export function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200 gap-3 p-6">
      <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {address ? <p className="text-sm text-gray-500 text-center">{address}</p> : null}
      <p className="text-xs text-gray-400">Map location not yet configured.</p>
    </div>
  );
}

