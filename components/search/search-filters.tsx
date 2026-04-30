"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertyTypes, wilayas } from "@/lib/constants";

export function SearchFilters({
  locale = "ar",
  initialValues = {}
}: {
  locale?: string;
  initialValues?: {
    q?: string;
    wilaya?: string;
    type?: string;
    maxPrice?: string;
    bedrooms?: string;
  };
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValues.q ?? "");
  const [wilaya, setWilaya] = useState(initialValues.wilaya ?? "all");
  const [type, setType] = useState(initialValues.type ?? "all");
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice ?? "");
  const [bedrooms, setBedrooms] = useState(initialValues.bedrooms ?? "");
  const searchHint = useMemo(() => (wilaya === "all" ? "Algiers" : wilaya), [wilaya]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (wilaya !== "all") params.set("wilaya", wilaya);
    if (type !== "all") params.set("type", type);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    router.push(`/${locale}/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      className="grid gap-3 rounded-[28px] border border-white/50 bg-white/90 p-4 shadow-panel lg:grid-cols-[1.3fr_repeat(4,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      <div className="relative">
        <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="ps-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search rentals or sales in ${searchHint}`}
        />
      </div>
      <Select value={wilaya} onValueChange={setWilaya}>
        <SelectTrigger>
          <SelectValue placeholder="Wilaya" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All wilayas</SelectItem>
          {wilayas.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {propertyTypes.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" type="number" />
      <Input value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} placeholder="Bedrooms" type="number" />
      <Button className="w-full lg:w-auto" variant="accent" type="submit">
        Search
      </Button>
    </form>
  );
}
