import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockPendingMedia, mockPendingOffers, mockInquiries } from '@/data/mockData';
import { Check, X, Download } from 'lucide-react';

const AdminDashboard = () => {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('cs-CZ');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Administrace</h1>
            <p className="text-muted-foreground">Správa médií, nabídek a poptávek</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Pending Media */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Média ke schválení</h2>
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médium</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Datum žádosti</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPendingMedia.map((media) => (
                  <TableRow key={media.id}>
                    <TableCell className="font-medium">{media.name}</TableCell>
                    <TableCell><Badge variant="secondary">{media.type}</Badge></TableCell>
                    <TableCell>{media.contact}</TableCell>
                    <TableCell>{formatDate(media.requestedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="text-emerald-600"><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive"><X className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Pending Offers */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Nabídky ke schválení</h2>
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nabídka</TableHead>
                  <TableHead>Médium</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPendingOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>{offer.media}</TableCell>
                    <TableCell>{formatDate(offer.submittedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="text-emerald-600"><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive"><X className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* All Inquiries */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Přehled poptávek</h2>
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nabídka</TableHead>
                  <TableHead>Médium</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell className="font-medium">{inq.offerTitle}</TableCell>
                    <TableCell>{inq.mediaName}</TableCell>
                    <TableCell><Badge variant="outline">{inq.status}</Badge></TableCell>
                    <TableCell>{inq.email}</TableCell>
                    <TableCell>{formatDate(inq.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
