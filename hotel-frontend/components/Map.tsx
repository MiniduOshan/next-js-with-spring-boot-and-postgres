"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '../lib/hotelData';
import Link from "next/link";
import { generateHotelSlug } from '../lib/utils';
import { MapPin, Star } from 'lucide-react';

const coordinates: Record<string, [number, number]> = {
  "Colombo": [6.9271, 79.8612],
  "Dambulla": [7.8731, 80.6511],
  "Ella": [6.8667, 81.0466],
  "Galle": [6.0535, 80.2210],
  "Nuwara Eliya": [6.9497, 80.7829],
  "Yala": [6.3770, 81.5160],
  "Sigiriya": [7.9541, 80.7580],
  "Mirissa": [5.9483, 80.4536],
  "Kandy": [7.2906, 80.6337],
  "Bentota": [6.4200, 79.9982]
};

// Custom Marker Icon
const customIcon = new L.DivIcon({
  html: `<div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%; transform: rotate(45deg);"></div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function HotelMap({ hotels }: { hotels: Hotel[] }) {
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);

  // Default center to Sri Lanka
  const defaultCenter: [number, number] = [7.8731, 80.7718];
  const center = hotels.length > 0 && coordinates[hotels[0].location] 
    ? coordinates[hotels[0].location] 
    : defaultCenter;

  return (
    <div className="w-full h-[calc(100vh-16rem)] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative z-10">
      <MapContainer center={center} zoom={8} scrollWheelZoom={true} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {hotels.map((hotel) => {
          const latLng = coordinates[hotel.location];
          if (!latLng) return null;

          // Add slight jitter so multiple hotels in the same city don't completely overlap
          const jitterLat = latLng[0] + (Math.random() - 0.5) * 0.05;
          const jitterLng = latLng[1] + (Math.random() - 0.5) * 0.05;

          const priceLabel = `LKR ${(Number(hotel.price) || 0).toLocaleString()}`;
          const priceIcon = new L.DivIcon({
            html: `<div style="background-color: #059669; color: white; padding: 4px 10px; border-radius: 9999px; font-family: sans-serif; font-weight: 800; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center; width: max-content; height: auto;">
                    ${priceLabel}
                   </div>`,
            className: '',
            iconSize: [80, 26],
            iconAnchor: [40, 13],
            popupAnchor: [0, -13],
          });

          return (
            <Marker 
              key={hotel.id} 
              position={[jitterLat, jitterLng]} 
              icon={priceIcon}
              eventHandlers={{
                click: () => setActiveHotel(hotel),
              }}
            >
              <Popup className="hotel-popup">
                <div className="w-48 sm:w-60 overflow-hidden -m-3">
                  <Link href={`/hotel/${generateHotelSlug(hotel)}`} className="block">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{hotel.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {hotel.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-700">LKR {Number(hotel.price).toLocaleString()}</span>
                        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-emerald-800" /> {hotel.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
