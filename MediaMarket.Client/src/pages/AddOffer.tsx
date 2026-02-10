import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { MediaTypeMap, PricingModelMap } from '@/api/mappers';
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

const AddOffer = () => {
  const navigate = useNavigate();
  const { userId } = useApp();
  
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
    try {
      setSubmitting(true);

      // Získaj mediaUserId z kontextu (uložené po prihlásení)
      if (!userId) {
        toast({
          title: 'Chyba',
          description: 'Musíte být přihlášeni pro vytvoření nabídky',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Konvertuj tags na flags enum
      let tagsValue = 0;
      if (tags['akce']) tagsValue |= 1;
      if (tags['speciál']) tagsValue |= 2;
      if (tags['last-minute']) tagsValue |= 4;

      // Urči pricing model podľa vybraného typu
      const pricingModel = data.pricingType === 'unit' ? PricingModelMap.unit : PricingModelMap.cpt;

      // Konvertuj dátumy - dátumové polia vracajú string v formáte YYYY-MM-DD
      const deadlineDate = data.deadline || null;
      const lastOrderDate = data.lastOrderDate || null;

      const response = await apiClient.offers.createOffer({
        mediaUserId: userId,
        requestBody: {
          title: data.title.trim(),
          mediaType: MediaTypeMap[data.mediaType as keyof typeof MediaTypeMap] || 0,
          format: data.format?.trim() || null,
          description: data.description.trim(),
          pricingModel,
          unitPrice: data.pricingType === 'unit' ? parseFloat(data.pricePerUnit || '0') : null,
          cpt: data.pricingType === 'cpt' ? parseFloat(data.cpt || '0') : null,
          minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
          discountPercent: parseFloat(data.discountPercent) || 0,
          tags: tagsValue as any,
          deadlineAssetsAt: deadlineDate,
          lastOrderDay: lastOrderDate,
          validFrom: data.validFrom,
          validTo: data.validTo,
          technicalConditionsText: data.technicalConditionsText?.trim() || null,
          technicalConditionsUrl: data.technicalConditionsUrl?.trim() || null,
        },
      });

      toast({
        title: 'Úspech',
        description: 'Ponuka bola úspešne publikovaná',
      });

      navigate('/media');
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se vytvořit nabídku',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => onSubmit(data))();
  };


  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/media" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zpět na dashboard
        </Link>

        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Nová nabídka</h1>

        <form className="space-y-6">
          <BasicInfoSection form={form} />
          <PricingSection form={form} />
          <TagsSection form={form} tags={tags} onTagsChange={setTags} />
          <DatesSection form={form} />
          <TechnicalConditionsSection form={form} />
          <FinalClientRequirementSection form={form} />
          <MediaKitSection />
          <OfferFormActions
            submitting={submitting}
            isFormValid={isFormValid}
            missingFields={missingFields}
            onPublish={() => handleSubmit()}
          />
        </form>
      </div>
    </div>
  );
};

export default AddOffer;
