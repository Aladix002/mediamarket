import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import OfferCard from '@/components/OfferCard';
import EmptyState from '@/components/EmptyState';
import { MediaType, OfferTag } from '@/data/mockData';
import { Search, SlidersHorizontal, X, FileX, Loader2, ChevronDown } from 'lucide-react';
import { useOffers } from '@/api/hooks';

const mediaTypes: { value: MediaType; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'rádio', label: 'Rádio' },
  { value: 'OOH', label: 'OOH' },
  { value: 'print', label: 'Print' },
  { value: 'sociální sítě', label: 'Sociální sítě' },
  { value: 'video', label: 'Video' },
  { value: 'influenceři', label: 'Influenceři' },
];

const sortOptions = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'cheapest', label: 'Nejlevnější' },
  { value: 'ends-soon', label: 'Končí nejdřív' },
  { value: 'biggest-discount', label: 'Největší sleva' },
  { value: 'most-inquired', label: 'Nejvíc poptávané' },
];

const tagFilters: { value: OfferTag; label: string }[] = [
  { value: 'akce', label: 'Akce' },
  { value: 'speciál', label: 'Speciál' },
  { value: 'last-minute', label: 'Last minute' },
];


const OffersListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<Set<MediaType>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<OfferTag>>(new Set());
  const [validFromFilter, setValidFromFilter] = useState('');
  const [validToFilter, setValidToFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [cptRange, setCptRange] = useState<[number, number]>([0, 0]);
  const [discountRange, setDiscountRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Načítaj ponuky z API BEZ filtrov na cenu/CPT a mediaType (aby sme mohli vypočítať min/max a filtrovať client-side)
  const { offers: allPublishedOffers, loading } = useOffers({
    status: 'published',
    // NEPOSIELAME mediaType - filtrovanie bude client-side pre multi-select
    validFrom: validFromFilter || undefined,
    validTo: validToFilter || undefined,
    // NEPOSIELAME minPrice, maxPrice, minCpt, maxCpt - chceme všetky offers na výpočet min/max
    // Tag filtering will be done client-side for multiple tags
    searchQuery: searchQuery || undefined,
  });

  // Vypočítaj min/max hodnoty pre cenu a CPT z načítaných offers
  const priceBounds = useMemo(() => {
    const prices = allPublishedOffers
      .map(o => o.pricePerUnit)
      .filter((p): p is number => p !== undefined && p !== null && p > 0);
    
    if (prices.length === 0) return { min: 0, max: 100000 };
    
    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000, // Zaokrúhli nadol na tisíc
      max: Math.ceil(Math.max(...prices) / 1000) * 1000, // Zaokrúhli nahor na tisíc
    };
  }, [allPublishedOffers]);

  const cptBounds = useMemo(() => {
    const cpts = allPublishedOffers
      .map(o => o.cpt)
      .filter((c): c is number => c !== undefined && c !== null && c > 0);
    
    if (cpts.length === 0) return { min: 0, max: 200 };
    
    return {
      min: Math.floor(Math.min(...cpts) / 5) * 5, // Zaokrúhli nadol na 5
      max: Math.ceil(Math.max(...cpts) / 5) * 5, // Zaokrúhli nahor na 5
    };
  }, [allPublishedOffers]);

  // Inicializuj priceRange a cptRange pri prvom načítaní offers - vždy na plné (min-max)
  useEffect(() => {
    if (priceBounds.max > 0) {
      // Vždy nastav na plné (min-max), aj keď sa bounds zmenia
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [priceBounds.max, priceBounds.min]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cptBounds.max > 0) {
      // Vždy nastav na plné (min-max), aj keď sa bounds zmenia
      setCptRange([cptBounds.min, cptBounds.max]);
    }
  }, [cptBounds.max, cptBounds.min]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side sorting and filtering (vrátane filtrov na cenu a CPT)
  const sortedOffers = useMemo(() => {
    let result = [...allPublishedOffers];

    // Media type filter (client-side) - multiple types can be selected (OR logic - offer must match at least one selected type)
    if (selectedMediaTypes.size > 0) {
      result = result.filter((o) => {
        return selectedMediaTypes.has(o.mediaType as MediaType);
      });
    }

    // Tag filter (client-side) - multiple tags can be selected (AND logic - all selected tags must be present)
    if (selectedTags.size > 0) {
      result = result.filter((o) => {
        // Check if offer has ALL selected tags (AND logic)
        // o.tags je array typu OfferTag[], selectedTags je Set<OfferTag>
        const offerTags = o.tags || [];
        const selectedTagsArray = Array.from(selectedTags);
        // Všetky vybrané tagy musia byť prítomné v offer tags
        return selectedTagsArray.every(tag => offerTags.includes(tag));
      });
    }

    // Price filter (client-side) - slider range
    result = result.filter((o) => {
      if (o.pricePerUnit) {
        return o.pricePerUnit >= priceRange[0] && o.pricePerUnit <= priceRange[1];
      }
      return true; // Ak nemá pricePerUnit, nefiltrujeme
    });

    // CPT filter (client-side) - slider range
    result = result.filter((o) => {
      if (o.cpt) {
        return o.cpt >= cptRange[0] && o.cpt <= cptRange[1];
      }
      return true; // Ak nemá CPT, nefiltrujeme
    });

    // Discount filter (client-side) - slider range
    result = result.filter((o) => {
      return o.discountPercent >= discountRange[0] && o.discountPercent <= discountRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'cheapest':
        result.sort((a, b) => {
          const priceA = a.pricePerUnit || a.cpt || 0;
          const priceB = b.pricePerUnit || b.cpt || 0;
          return priceA - priceB;
        });
        break;
      case 'ends-soon':
        result.sort((a, b) => new Date(a.validTo).getTime() - new Date(b.validTo).getTime());
        break;
      case 'biggest-discount':
        result.sort((a, b) => {
          const discountDiff = b.discountPercent - a.discountPercent;
          if (discountDiff !== 0) return discountDiff;
          // Tie-breaker: newest first
          return new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime();
        });
        break;
      case 'most-inquired':
        // Mock: just reverse order for demo
        result.reverse();
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
    }

    return result;
  }, [allPublishedOffers, selectedMediaTypes, selectedTags, priceRange, cptRange, discountRange, sortBy]);

  const toggleMediaType = (mediaType: MediaType) => {
    setSelectedMediaTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaType)) {
        newSet.delete(mediaType);
      } else {
        newSet.add(mediaType);
      }
      return newSet;
    });
  };

  const toggleTag = (tag: OfferTag) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMediaTypes(new Set());
    setSelectedTags(new Set());
    setValidFromFilter('');
    setValidToFilter('');
    // Reset na plné (min-max) hodnoty z offers
    if (priceBounds.max > 0) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
    if (cptBounds.max > 0) {
      setCptRange([cptBounds.min, cptBounds.max]);
    }
    setDiscountRange([0, 100]);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || 
    selectedMediaTypes.size > 0 || 
    selectedTags.size > 0 || 
    validFromFilter ||
    validToFilter ||
    priceRange[0] > priceBounds.min ||
    priceRange[1] < priceBounds.max ||
    cptRange[0] > cptBounds.min ||
    cptRange[1] < cptBounds.max ||
    discountRange[0] > 0 ||
    discountRange[1] < 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Aktuální nabídky
          </h1>
          <p className="text-muted-foreground">
            Procházejte {allPublishedOffers.length} akčních nabídek mediálního prostoru
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledej podle média, formátu nebo klíčového slova…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtry
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Řazení" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop filters */}
          <div className={`flex flex-wrap gap-3 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[160px] justify-between">
                  <span>
                    {selectedMediaTypes.size === 0
                      ? 'Typ média'
                      : selectedMediaTypes.size === 1
                      ? mediaTypes.find(t => t.value === Array.from(selectedMediaTypes)[0])?.label || 'Typ média'
                      : `${selectedMediaTypes.size} typy`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[160px]">
                {mediaTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedMediaTypes.has(type.value)}
                    onCheckedChange={() => toggleMediaType(type.value)}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {tagFilters.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`filter-chip ${selectedTags.has(tag.value) ? 'filter-chip-active' : ''}`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Date range filter - inline with tags */}
              <div className="flex items-center gap-2">
                <Label htmlFor="validFrom" className="text-xs text-muted-foreground whitespace-nowrap">Období:</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={validFromFilter}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setValidFromFilter(newFrom);
                    // Ak je validTo menšie alebo rovné validFrom, nastav validTo na deň po validFrom
                    if (validToFilter && newFrom && validToFilter <= newFrom) {
                      const fromDate = new Date(newFrom);
                      fromDate.setDate(fromDate.getDate() + 1);
                      setValidToFilter(fromDate.toISOString().split('T')[0]);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]} // Minimálne dnes
                  className="w-[140px]"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  id="validTo"
                  type="date"
                  value={validToFilter}
                  onChange={(e) => {
                    const newTo = e.target.value;
                    // Validácia: validTo musí byť väčšie ako validFrom
                    if (validFromFilter && newTo && newTo <= validFromFilter) {
                      // Ak je validTo menšie alebo rovné validFrom, nastav na deň po validFrom
                      const fromDate = new Date(validFromFilter);
                      fromDate.setDate(fromDate.getDate() + 1);
                      setValidToFilter(fromDate.toISOString().split('T')[0]);
                    } else {
                      setValidToFilter(newTo);
                    }
                  }}
                  min={validFromFilter ? (() => {
                    const fromDate = new Date(validFromFilter);
                    fromDate.setDate(fromDate.getDate() + 1);
                    return fromDate.toISOString().split('T')[0];
                  })() : new Date().toISOString().split('T')[0]} // Minimálne deň po validFrom, alebo dnes ak nie je validFrom
                  className="w-[140px]"
                />
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Zrušit filtry
                </Button>
              )}
            </div>
          </div>

          {/* Advanced filters - Price, CPT and Discount sliders in one row */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
            {/* Price range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Cena za ks (Kč)</Label>
                <span className="text-xs text-muted-foreground">
                  {priceRange[0].toLocaleString('cs-CZ')} - {priceRange[1].toLocaleString('cs-CZ')}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={priceBounds.min}
                max={priceBounds.max}
                step={1000}
                className="w-full"
                disabled={priceBounds.max === 0}
              />
            </div>

            {/* CPT range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">CPT (Kč)</Label>
                <span className="text-xs text-muted-foreground">
                  {cptRange[0]} - {cptRange[1]}
                </span>
              </div>
              <Slider
                value={cptRange}
                onValueChange={(value) => setCptRange(value as [number, number])}
                min={cptBounds.min}
                max={cptBounds.max}
                step={5}
                className="w-full"
                disabled={cptBounds.max === 0}
              />
            </div>

            {/* Discount range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Sleva (%)</Label>
                <span className="text-xs text-muted-foreground">
                  {discountRange[0]}% - {discountRange[1]}%
                </span>
              </div>
              <Slider
                value={discountRange}
                onValueChange={(value) => setDiscountRange(value as [number, number])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {sortedOffers.length} {sortedOffers.length === 1 ? 'nabídka' : sortedOffers.length < 5 ? 'nabídky' : 'nabídek'}
            </p>
          </div>
        )}

        {/* Offers grid */}
        {!loading && sortedOffers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {!loading && sortedOffers.length === 0 && (
          <EmptyState
            icon={FileX}
            title="Žádné výsledky"
            description="Pro zadané parametry jsme nenašli žádnou nabídku. Zkuste upravit filtry."
            actionLabel="Zobrazit vše"
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default OffersListing;
