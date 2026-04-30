"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyTypes, wilayas } from "@/lib/constants";

function readNumber(value: FormDataEntryValue | null, fallback = 0) {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ListingWizard({ locale }: { locale: string }) {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState("RENT");
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [wilaya, setWilaya] = useState("Algiers");
  const [parking, setParking] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      priceDzd: readNumber(form.get("priceDzd")),
      transactionType,
      propertyType,
      wilaya,
      commune: String(form.get("commune") ?? ""),
      neighborhood: String(form.get("neighborhood") ?? ""),
      addressHint: String(form.get("addressHint") ?? ""),
      bedrooms: readNumber(form.get("bedrooms")),
      bathrooms: readNumber(form.get("bathrooms")),
      areaM2: readNumber(form.get("areaM2")),
      floor: readNumber(form.get("floor")),
      parking,
      furnished,
      latitude: readNumber(form.get("latitude"), 36.7538),
      longitude: readNumber(form.get("longitude"), 3.0588),
      amenities: String(form.get("amenities") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Please check the highlighted fields and try again.");
        return;
      }

      setSuccess(result.message ?? "Your request has been sent successfully and is waiting for admin approval.");
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }, 900);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 rounded-3xl bg-white p-6 shadow-panel md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="title">Listing title</Label>
          <Input id="title" name="title" placeholder="Appartement haut standing a Hydra" required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Describe the property, neighborhood, and trust details." required />
        </div>
        <div>
          <Label>Transaction type</Label>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RENT">Rent</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Property type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priceDzd">Price (DZD)</Label>
          <Input id="priceDzd" name="priceDzd" type="number" min="1" placeholder="125000" required />
        </div>
        <div>
          <Label htmlFor="areaM2">Area m²</Label>
          <Input id="areaM2" name="areaM2" type="number" min="1" placeholder="110" required />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="1" required />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" name="bathrooms" type="number" min="0" defaultValue="1" required />
        </div>
        <div>
          <Label>Wilaya</Label>
          <Select value={wilaya} onValueChange={setWilaya}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {wilayas.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="commune">Commune</Label>
          <Input id="commune" name="commune" placeholder="Hydra" required />
        </div>
        <div>
          <Label htmlFor="neighborhood">Neighborhood</Label>
          <Input id="neighborhood" name="neighborhood" placeholder="Hydra Centre" required />
        </div>
        <div>
          <Label htmlFor="addressHint">Address hint</Label>
          <Input id="addressHint" name="addressHint" placeholder="Near schools and embassies" required />
        </div>
        <div>
          <Label htmlFor="floor">Floor</Label>
          <Input id="floor" name="floor" type="number" min="0" defaultValue="0" />
        </div>
        <div>
          <Label htmlFor="amenities">Amenities</Label>
          <Input id="amenities" name="amenities" placeholder="Parking, Balcony, Security" />
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="0.0001" defaultValue="36.7538" />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="0.0001" defaultValue="3.0588" />
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-brand-gray px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" checked={parking} onChange={(event) => setParking(event.target.checked)} />
          Parking available
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-brand-gray px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" checked={furnished} onChange={(event) => setFurnished(event.target.checked)} />
          Furnished
        </label>
      </div>
      {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
      <div className="flex justify-end gap-3">
        <Button variant="accent" type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit for verification"}
        </Button>
      </div>
    </form>
  );
}
