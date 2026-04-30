"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type MapListing = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  wilaya: string;
  commune: string;
};

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const center = listings[0] ? [listings[0].latitude, listings[0].longitude] as [number, number] : [36.7538, 3.0588] as [number, number];

  return (
    <div className="h-[420px] overflow-hidden rounded-3xl border border-white/50 shadow-panel">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {listings.map((listing) => (
          <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div className="font-medium">{listing.title}</div>
              <div className="text-sm text-slate-600">
                {listing.commune}, {listing.wilaya}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
