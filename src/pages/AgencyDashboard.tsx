import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import { FileText, ExternalLink, Inbox } from 'lucide-react';

const AgencyDashboard = () => {
  const { inquiries } = useApp();
  const navigate = useNavigate();

  const statusStyles: Record<string, string> = {
    nová: 'status-nova',
    'v řešení': 'status-reseni',
    uzavřená: 'status-uzavrena',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Moje poptávky</h1>
            <p className="text-muted-foreground">
              Přehled vašich odeslaných poptávek a jejich stav
            </p>
          </div>
          <Link to="/offers">
            <Button>
              Procházet nabídky
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Inquiries list */}
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusStyles[inquiry.status]}>
                        {inquiry.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1">
                      {inquiry.offerTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {inquiry.mediaName}
                    </p>
                    {inquiry.note && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {inquiry.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:items-center">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Termín</p>
                      <p className="font-medium">{inquiry.term}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Rozpočet</p>
                      <p className="font-medium">{inquiry.budget}</p>
                    </div>
                    <Link to={`/offers/${inquiry.offerId}`}>
                      <Button variant="outline" size="sm">
                        Detail nabídky
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Zatím nemáte žádné poptávky"
            description="Procházejte nabídky a odesílejte poptávky na zajímavé mediální prostory."
            actionLabel="Procházet nabídky"
            onAction={() => navigate('/offers')}
          />
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;
