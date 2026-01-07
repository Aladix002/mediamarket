import { Link } from 'react-router-dom';
import { Offer, OfferTag } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
}

const tagLabels: Record<OfferTag, string> = {
  akce: 'Akce',
  speciál: 'Speciál',
  'last-minute': 'Last minute',
};

const tagStyles: Record<OfferTag, string> = {
  akce: 'tag-akce',
  speciál: 'tag-special',
  'last-minute': 'tag-lastminute',
};

const mediaTypeLabels: Record<string, string> = {
  online: 'Online',
  rádio: 'Rádio',
  OOH: 'OOH',
  print: 'Print',
  newsletter: 'Newsletter',
};

const OfferCard = ({ offer }: OfferCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Link to={`/offers/${offer.id}`} className="block">
      <article className="card-offer p-5 h-full flex flex-col">
        {/* Tags */}
        {offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {offer.tags.map((tag) => (
              <Badge key={tag} variant="outline" className={`text-xs font-medium ${tagStyles[tag]}`}>
                {tagLabels[tag]}
              </Badge>
            ))}
          </div>
        )}

        {/* Media info */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {mediaTypeLabels[offer.mediaType]}
          </Badge>
          <span className="text-xs text-muted-foreground">{offer.mediaName}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 flex-grow">
          {offer.title}
        </h3>

        {/* Format */}
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          {offer.format}
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {offer.description}
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between pt-3 border-t mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">Cena od</p>
            <p className="font-display font-bold text-lg text-primary">
              {formatPrice(offer.priceFrom)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3" />
              Platnost
            </p>
            <p className="text-sm font-medium">
              {formatDate(offer.validFrom)} – {formatDate(offer.validTo)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default OfferCard;
