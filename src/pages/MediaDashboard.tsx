import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockOffers, mockInquiries } from '@/data/mockData';
import EmptyState from '@/components/EmptyState';
import { Plus, Edit, Archive, FileText, Inbox, ExternalLink } from 'lucide-react';

const MediaDashboard = () => {
  const navigate = useNavigate();

  // Simulate media's own offers (using first 8 offers as "mine")
  const myOffers = mockOffers.slice(0, 8);
  // Simulate inquiries on my offers
  const myInquiries = mockInquiries.slice(0, 2);

  const statusStyles: Record<string, string> = {
    draft: 'bg-secondary text-secondary-foreground',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-muted text-muted-foreground',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Koncept',
    published: 'Publikováno',
    archived: 'Archivováno',
  };

  const inquiryStatusStyles: Record<string, string> = {
    nová: 'status-nova',
    'v řešení': 'status-reseni',
    uzavřená: 'status-uzavrena',
  };

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Dashboard média</h1>
            <p className="text-muted-foreground">
              Spravujte své nabídky a sledujte poptávky
            </p>
          </div>
          <Link to="/media/offers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Přidat nabídku
            </Button>
          </Link>
        </div>

        {/* My offers */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold mb-4">Moje nabídky</h2>

          {myOffers.length > 0 ? (
            <div className="bg-card rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Název</TableHead>
                    <TableHead>Stav</TableHead>
                    <TableHead>Platnost</TableHead>
                    <TableHead>Cena od</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{offer.title}</p>
                          <p className="text-sm text-muted-foreground">{offer.format}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[offer.status]}>
                          {statusLabels[offer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(offer.validFrom)} – {formatDate(offer.validTo)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(offer.priceFrom)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Upravit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Archivovat">
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Link to={`/offers/${offer.id}`}>
                            <Button variant="ghost" size="icon" title="Zobrazit">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Zatím nemáte žádné nabídky"
              description="Vytvořte svou první nabídku a oslovte potenciální zákazníky."
              actionLabel="Vytvořit nabídku"
              onAction={() => navigate('/media/offers/new')}
            />
          )}
        </section>

        {/* Inquiries on my offers */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Poptávky na moje nabídky</h2>

          {myInquiries.length > 0 ? (
            <div className="space-y-4">
              {myInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-card rounded-xl border p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={inquiryStatusStyles[inquiry.status]}>
                          {inquiry.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{inquiry.offerTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {inquiry.note}
                      </p>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Kontakt</p>
                          <p className="font-medium">{inquiry.contactPerson}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">E-mail</p>
                          <p className="font-medium">{inquiry.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Telefon</p>
                          <p className="font-medium">{inquiry.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Odpovědět
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Zatím nemáte žádné poptávky"
              description="Jakmile někdo poptá vaši nabídku, uvidíte to zde."
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default MediaDashboard;
