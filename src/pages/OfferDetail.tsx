import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOffers, OfferTag } from '@/data/mockData';
import InquiryModal from '@/components/InquiryModal';
import { useApp } from '@/contexts/AppContext';
import {
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  Check,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';

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

const OfferDetail = () => {
  const { id } = useParams();
  const { role } = useApp();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const offer = mockOffers.find((o) => o.id === id);

  if (!offer) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Nabídka nenalezena</h1>
          <Link to="/offers">
            <Button>Zpět na nabídky</Button>
          </Link>
        </div>
      </div>
    );
  }

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
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to="/offers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zpět na nabídky
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              {offer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {offer.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className={`${tagStyles[tag]}`}>
                      {tagLabels[tag]}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {offer.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{mediaTypeLabels[offer.mediaType]}</Badge>
                <span>{offer.mediaName}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl border p-6">
              <p className="text-foreground leading-relaxed">{offer.description}</p>
            </div>

            {/* What's included */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Co je v nabídce
              </h2>
              <ul className="space-y-2">
                {offer.whatsIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Specifikace
              </h2>
              <dl className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Formát</dt>
                  <dd className="font-medium">{offer.format}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Typ média</dt>
                  <dd className="font-medium">{mediaTypeLabels[offer.mediaType]}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Platnost od</dt>
                  <dd className="font-medium">{formatDate(offer.validFrom)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Platnost do</dt>
                  <dd className="font-medium">{formatDate(offer.validTo)}</dd>
                </div>
              </dl>
            </div>

            {/* Terms */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Podmínky
              </h2>
              <p className="text-muted-foreground mb-4">{offer.terms}</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline na dodání podkladů:</span>
                <span className="font-medium">{offer.deadline}</span>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Přílohy
              </h2>
              <Button variant="outline" className="gap-2" disabled>
                <FileText className="h-4 w-4" />
                Media kit (PDF)
                <Badge variant="secondary" className="ml-2 text-xs">
                  Placeholder
                </Badge>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl border p-6 space-y-6">
              {/* Price */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cena od (bez DPH)</p>
                <p className="font-display text-3xl font-bold text-primary">
                  {formatPrice(offer.priceFrom)}
                </p>
              </div>

              {/* Validity */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Platnost nabídky</p>
                  <p className="font-medium text-sm">
                    {formatDate(offer.validFrom)} – {formatDate(offer.validTo)}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full"
                onClick={() => setInquiryOpen(true)}
              >
                Nezávazně poptat
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.
              </p>

              {/* Media info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Nabízí</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    📰
                  </div>
                  <div>
                    <p className="font-medium">{offer.mediaName}</p>
                    <p className="text-sm text-muted-foreground">
                      {mediaTypeLabels[offer.mediaType]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal offer={offer} open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </div>
  );
};

export default OfferDetail;
