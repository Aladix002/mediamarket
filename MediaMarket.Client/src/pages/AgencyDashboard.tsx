import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import { ExternalLink, Inbox, Loader2 } from 'lucide-react';
import { OrderStatus } from '@/data/mockData';
import { useOrders } from '@/api/hooks';

const AgencyDashboard = () => {
  const { role } = useApp();
  const navigate = useNavigate();
  
  // TODO: Získať agencyUserId z JWT tokenu alebo contextu
  const agencyUserId = 'temp-agency-id'; // Temporary
  const { orders, loading } = useOrders({ agencyUserId });

  const orderStatusStyles: Record<OrderStatus, string> = {
    'nová': 'status-nova',
    'v řešení': 'status-reseni',
    'objednávka uzavřena': 'status-uzavrena',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Moje objednávky</h1>
            <p className="text-muted-foreground">
              Přehled vašich odeslaných objednávek a jejich stav
            </p>
          </div>
          <Link to="/offers">
            <Button>
              Procházet nabídky
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium text-primary">
                        {order.orderId}
                      </span>
                      <Badge className={orderStatusStyles[order.status]}>
                        {order.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1">
                      {order.offerTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.mediaName}
                    </p>
                    {order.note && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {order.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:items-center">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Termín</p>
                      <p className="font-medium">
                        {formatDate(order.preferredFrom)} – {formatDate(order.preferredTo)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Celková cena</p>
                      <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                    </div>
                    <Link to={`/offers/${order.offerId}`}>
                      <Button variant="outline" size="sm">
                        Detail nabídky
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="Zatím nemáte žádné objednávky"
            description="Procházejte nabídky a odesílejte objednávky na zajímavé mediální prostory."
            actionLabel="Procházet nabídky"
            onAction={() => navigate('/offers')}
          />
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;
