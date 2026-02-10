import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { OrderStatus } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import { Plus, Edit, FileText, Inbox, ExternalLink, Loader2, Download, Trash2 } from 'lucide-react';
import { useOffers, useOrders, useUpdateOrderStatus } from '@/api/hooks';

const MediaDashboard = () => {
  const navigate = useNavigate();
  const { role, userId } = useApp();

  // Získaj mediaUserId z kontextu (uložené po prihlásení)
  const mediaUserId = userId;
  
  const { offers: allOffers, loading: offersLoading } = useOffers(mediaUserId ? { mediaUserId } : undefined);
  const { orders: allOrders, loading: ordersLoading, refetch: refetchOrders } = useOrders(mediaUserId ? { mediaUserId } : undefined);
  const { updateStatus } = useUpdateOrderStatus();

  const myOffers = allOffers;
  const myOrders = allOrders;

  const statusStyles: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-muted text-muted-foreground',
  };

  const statusLabels: Record<string, string> = {
    published: 'Publikováno',
    archived: 'Archivováno',
  };

  const orderStatusStyles: Record<OrderStatus, string> = {
    'nová': 'status-nova',
    'v řešení': 'status-reseni',
    'objednávka uzavřena': 'status-uzavrena',
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
      year: 'numeric',
    });
  };

  const handleDownloadPdf = async (orderId: string, orderNumber: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5234'}/api/orders/${orderId}/pdf`);
      if (!response.ok) {
        throw new Error('Nepodařilo se stáhnout PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `objednavka-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Chyba při stahování PDF:', error);
      alert('Nepodařilo se stáhnout PDF objednávky');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      refetchOrders();
    } catch (error) {
      // Error je už spracovaný v hooku
    }
  };

  const canChangeStatus = role === 'media' || role === 'admin';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Dashboard média</h1>
            <p className="text-muted-foreground">
              Spravujte své nabídky a sledujte objednávky
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

          {offersLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!offersLoading && myOffers.length > 0 && (
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
                        <TooltipProvider delayDuration={0}>
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => navigate(`/media/offers/${offer.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upravit</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Smazat</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={`/offers/${offer.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Zobrazit</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!offersLoading && myOffers.length === 0 && (
            <EmptyState
              icon={FileText}
              title="Zatím nemáte žádné nabídky"
              description="Vytvořte svou první nabídku a oslovte potenciální zákazníky."
              actionLabel="Vytvořit nabídku"
              onAction={() => navigate('/media/offers/new')}
            />
          )}
        </section>

        {/* Orders on my offers */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Objednávky na moje nabídky</h2>

          {ordersLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!ordersLoading && myOrders.length > 0 && (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-xl border p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
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
                      <h3 className="font-semibold mb-1">{order.offerTitle}</h3>
                      {order.note && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {order.note}
                        </p>
                      )}
                      <div className="grid sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Kontakt</p>
                          <p className="font-medium">{order.contactName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">E-mail</p>
                          <p className="font-medium">{order.contactEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Telefon</p>
                          <p className="font-medium">{order.contactPhone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Celková cena</p>
                          <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                        </div>
                      </div>
                      {order.finalClient && (
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Finální klient: </span>
                          <span className="font-medium">{order.finalClient}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPdf(order.id, order.orderId)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Stáhnout PDF
                      </Button>
                      {/* Status change dropdown */}
                      {canChangeStatus && (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <p className="text-sm text-muted-foreground">Zadejte stav objednávky</p>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nová">nová</SelectItem>
                              <SelectItem value="v řešení">v řešení</SelectItem>
                              <SelectItem value="objednávka uzavřena">objednávka uzavřena</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!ordersLoading && myOrders.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Zatím nemáte žádné objednávky"
              description="Jakmile někdo objedná vaši nabídku, uvidíte to zde."
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default MediaDashboard;
