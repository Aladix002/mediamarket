import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import OfferCard from '@/components/OfferCard';
import EmptyState from '@/components/EmptyState';
import { mockOffers, MediaType, OfferTag } from '@/data/mockData';
import { Search, SlidersHorizontal, X, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mediaTypes: { value: MediaType | 'all'; label: string }[] = [
  { value: 'all', label: 'Všechny typy' },
  { value: 'online', label: 'Online' },
  { value: 'rádio', label: 'Rádio' },
  { value: 'OOH', label: 'OOH' },
  { value: 'print', label: 'Print' },
  { value: 'newsletter', label: 'Newsletter' },
];

const sortOptions = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'cheapest', label: 'Nejlevnější' },
  { value: 'ends-soon', label: 'Končí brzy' },
];

const tagFilters: { value: OfferTag | 'all'; label: string }[] = [
  { value: 'all', label: 'Vše' },
  { value: 'akce', label: 'Akce' },
  { value: 'speciál', label: 'Speciál' },
  { value: 'last-minute', label: 'Last minute' },
];

const OffersListing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<OfferTag | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const publishedOffers = mockOffers.filter(o => o.status === 'published');

  const filteredOffers = useMemo(() => {
    let result = [...publishedOffers];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          o.mediaName.toLowerCase().includes(query) ||
          o.description.toLowerCase().includes(query) ||
          o.format.toLowerCase().includes(query)
      );
    }

    // Media type filter
    if (mediaTypeFilter !== 'all') {
      result = result.filter((o) => o.mediaType === mediaTypeFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter((o) => o.tags.includes(tagFilter));
    }

    // Sort
    switch (sortBy) {
      case 'cheapest':
        result.sort((a, b) => a.priceFrom - b.priceFrom);
        break;
      case 'ends-soon':
        result.sort((a, b) => new Date(a.validTo).getTime() - new Date(b.validTo).getTime());
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
    }

    return result;
  }, [publishedOffers, searchQuery, mediaTypeFilter, tagFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setMediaTypeFilter('all');
    setTagFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || mediaTypeFilter !== 'all' || tagFilter !== 'all';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Aktuální nabídky
          </h1>
          <p className="text-muted-foreground">
            Procházejte {publishedOffers.length} akčních nabídek mediálního prostoru
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat v nabídkách..."
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
                <SelectTrigger className="w-full sm:w-[160px]">
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
            <Select
              value={mediaTypeFilter}
              onValueChange={(v) => setMediaTypeFilter(v as MediaType | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Typ média" />
              </SelectTrigger>
              <SelectContent>
                {mediaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              {tagFilters.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setTagFilter(tag.value)}
                  className={`filter-chip ${tagFilter === tag.value ? 'filter-chip-active' : ''}`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Zrušit filtry
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredOffers.length} {filteredOffers.length === 1 ? 'nabídka' : filteredOffers.length < 5 ? 'nabídky' : 'nabídek'}
          </p>
        </div>

        {/* Offers grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileX}
            title="Žádné nabídky nenalezeny"
            description="Zkuste změnit filtry nebo vyhledávací dotaz pro zobrazení nabídek."
            actionLabel="Zobrazit všechny nabídky"
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default OffersListing;
