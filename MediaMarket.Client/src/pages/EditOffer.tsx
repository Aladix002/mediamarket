import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { offerSchema, OfferFormData, OfferTags } from '@/types/offerForm';
import { BasicInfoSection } from '@/components/offers/BasicInfoSection';
import { PricingSection } from '@/components/offers/PricingSection';
import { TagsSection } from '@/components/offers/TagsSection';
import { DatesSection } from '@/components/offers/DatesSection';
import { TechnicalConditionsSection } from '@/components/offers/TechnicalConditionsSection';
import { FinalClientRequirementSection } from '@/components/offers/FinalClientRequirementSection';
import { MediaKitSection } from '@/components/offers/MediaKitSection';
import { OfferFormActions } from '@/components/offers/OfferFormActions';
import { useOffer, useUpdateOffer } from '@/api/hooks';

const EditOffer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId } = useApp();
  
  const { offer, loading: offerLoading } = useOffer(id);
  const { updateOffer, loading: updating } = useUpdateOffer();
  
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      mediaType: '',
      format: '',
      pricingType: undefined,
      pricePerUnit: '',
      cpt: '',
      minOrderValue: '',
      discountPercent: '0',
      validFrom: '',
      validTo: '',
      description: '',
      whatsIncluded: '',
      technicalConditionsText: '',
      technicalConditionsUrl: '',
      deadline: '',
      lastOrderDate: '',
      requireFinalClient: false,
    },
  });

  // Tag checkboxes
  const [tags, setTags] = useState<OfferTags>({
    'last-minute': false,
    'speciál': false,
    'akce': false,
  });

  const [submitting, setSubmitting] = useState(false);
  
  // Watch form values for use in JSX
  const formData = form.watch();

  // Load offer data into form when offer is loaded
  useEffect(() => {
    if (offer) {
      // Determine pricing type
      const pricingType = offer.cpt !== undefined && offer.cpt > 0 ? 'cpt' : 'unit';
      
      // Format dates for input fields (YYYY-MM-DD)
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        title: offer.title || '',
        mediaType: offer.mediaType || '',
        format: offer.format || '',
        pricingType: pricingType,
        pricePerUnit: offer.pricePerUnit?.toString() || '',
        cpt: offer.cpt?.toString() || '',
        minOrderValue: offer.minOrderValue?.toString() || '',
        discountPercent: offer.discountPercent?.toString() || '0',
        validFrom: formatDateForInput(offer.validFrom),
        validTo: formatDateForInput(offer.validTo),
        description: offer.description || '',
        whatsIncluded: offer.whatsIncluded?.join('\n') || '',
        technicalConditionsText: offer.technicalConditionsText || '',
        technicalConditionsUrl: offer.technicalConditionsUrl || '',
        deadline: formatDateForInput(offer.deadline),
        lastOrderDate: offer.lastOrderDate ? formatDateForInput(offer.lastOrderDate) : '',
        requireFinalClient: offer.requireFinalClient || false,
      });

      // Set tags
      setTags({
        'akce': offer.tags?.includes('akce') || false,
        'speciál': offer.tags?.includes('speciál') || false,
        'last-minute': offer.tags?.includes('last-minute') || false,
      });
    }
  }, [offer, form]);

  // Kontrola, či sú všetky povinné polia vyplnené
  const getMissingRequiredFields = (): string[] => {
    const missing: string[] = [];
    const data = formData;

    if (!data.title || data.title.trim() === '') {
      missing.push('Název nabídky');
    }
    if (!data.mediaType || data.mediaType.trim() === '') {
      missing.push('Typ média');
    }
    if (!data.validFrom || data.validFrom.trim() === '') {
      missing.push('Platnost nabídky od');
    }
    if (!data.validTo || data.validTo.trim() === '') {
      missing.push('Platnost nabídky do');
    }
    if (!data.description || data.description.trim() === '') {
      missing.push('Popis nabídky');
    }
    if (!data.pricingType) {
      missing.push('Typ ceny');
    } else if (data.pricingType === 'unit' && (!data.pricePerUnit || parseFloat(data.pricePerUnit) <= 0)) {
      missing.push('Cena za ks');
    } else if (data.pricingType === 'cpt' && (!data.cpt || parseFloat(data.cpt) <= 0)) {
      missing.push('CPT');
    }

    return missing;
  };

  const missingFields = getMissingRequiredFields();
  const isFormValid = missingFields.length === 0;

  const onSubmit = async (data: OfferFormData) => {
    if (!id) {
      toast({
        title: 'Chyba',
        description: 'ID nabídky není k dispozici',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Konvertuj dátumy - dátumové polia vracajú string v formáte YYYY-MM-DD
      const deadlineDate = data.deadline || null;
      const lastOrderDate = data.lastOrderDate || null;

      await updateOffer(id, {
        title: data.title,
        mediaType: data.mediaType as any,
        format: data.format,
        description: data.description,
        pricingType: data.pricingType as 'unit' | 'cpt',
        pricePerUnit: data.pricePerUnit ? parseFloat(data.pricePerUnit) : undefined,
        cpt: data.cpt ? parseFloat(data.cpt) : undefined,
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : undefined,
        discountPercent: parseFloat(data.discountPercent) || 0,
        tags: tags,
        validFrom: data.validFrom,
        validTo: data.validTo,
        deadline: deadlineDate || undefined,
        lastOrderDate: lastOrderDate || undefined,
        technicalConditionsText: data.technicalConditionsText,
        technicalConditionsUrl: data.technicalConditionsUrl,
      });

      navigate('/media');
    } catch (error) {
      // Error je už spracovaný v hooku
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => onSubmit(data))();
  };

  if (offerLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/media" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na dashboard
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nabídka nebyla nalezena</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/media" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zpět na dashboard
        </Link>

        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Upravit nabídku</h1>

        <form className="space-y-6">
          <BasicInfoSection form={form} />
          <PricingSection form={form} />
          <TagsSection form={form} tags={tags} onTagsChange={setTags} />
          <DatesSection form={form} />
          <TechnicalConditionsSection form={form} />
          <FinalClientRequirementSection form={form} />
          <MediaKitSection />
          <OfferFormActions
            submitting={submitting || updating}
            isFormValid={isFormValid}
            missingFields={missingFields}
            onPublish={() => handleSubmit()}
          />
        </form>
      </div>
    </div>
  );
};

export default EditOffer;
