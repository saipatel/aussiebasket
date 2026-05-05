"use client";
import { useEffect, useState } from "react";
import { MapPin, Clock, Navigation } from "lucide-react";
import { NearbyStore } from "@/lib/types";

export default function NearbyPage() {
  const [postcode, setPostcode] = useState("2000");
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(pc: string) {
    setLoading(true);
    const r = await fetch(`/api/nearby?postcode=${encodeURIComponent(pc)}`);
    setStores(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(postcode); }, []); // initial

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stores near you</h1>
        <p className="text-ink-500 text-sm">Find the closest Coles, Woolworths, ALDI, and IGA.</p>
      </div>

      <div className="card flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[200px]">
          <span className="text-sm font-medium">Postcode</span>
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="input mt-1"
            placeholder="e.g. 2000"
          />
        </label>
        <button onClick={() => load(postcode)} className="btn-primary" disabled={loading}>
          <Navigation size={16} /> Find stores
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {stores.map((s) => (
          <div key={s.name} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-ink-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={14} /> {s.address}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-brand-700">{s.distanceKm} km</div>
                <div className={`badge mt-1 ${s.openNow ? "badge-save" : "badge-warn"}`}>
                  <Clock size={12} /> {s.openNow ? "Open now" : "Closed"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
