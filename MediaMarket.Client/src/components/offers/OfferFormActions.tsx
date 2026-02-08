import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, Loader2 } from 'lucide-react';

interface OfferFormActionsProps {
  submitting: boolean;
  isFormValid: boolean;
  missingFields: string[];
  onPublish: () => void;
}

export const OfferFormActions = ({ 
  submitting, 
  isFormValid, 
  missingFields, 
  onPublish 
}: OfferFormActionsProps) => {
  return (
    <div className="flex gap-3">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Button 
                type="button" 
                onClick={onPublish} 
                className="flex-1 w-full"
                disabled={submitting || !isFormValid}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publikujem...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publikovat
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {!isFormValid && missingFields.length > 0 && (
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Chybí povinná pole:</p>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
