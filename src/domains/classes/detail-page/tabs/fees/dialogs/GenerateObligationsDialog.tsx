import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  generateObligationsSchema,
  type GenerateObligationsFormData,
  MONTH_OPTIONS,
  getYearOptions,
  getGenerateObligationsDefaults,
  getPeriodDates,
} from '@/domains/classes/schemas/generateObligationsSchema';
import obligationsApiService from '@/services/obligationsApiService';
import type { GenerateBulkObligationsRequest, GenerateBulkObligationsResponse } from '@/types/api/obligations';
import type { ClassFeeTemplate } from '@/types/api/classFees';

type DialogStep = 'configure' | 'generating' | 'results';

interface GenerateObligationsDialogProps {
  classId: string;
  className: string;
  enrolledCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeTemplates: ClassFeeTemplate[];
  onSuccess: () => void;
}

export function GenerateObligationsDialog({
  classId,
  className,
  enrolledCount,
  open,
  onOpenChange,
  feeTemplates,
  onSuccess,
}: GenerateObligationsDialogProps) {
  const [step, setStep] = useState<DialogStep>('configure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateBulkObligationsResponse | null>(null);

  const yearOptions = useMemo(() => getYearOptions(), []);

  // Filter to only recurring templates for pre-selection
  const recurringTemplateIds = useMemo(
    () => feeTemplates.filter((t) => t.isRecurring).map((t) => t.id),
    [feeTemplates]
  );

  const form = useForm<GenerateObligationsFormData>({
    resolver: zodResolver(generateObligationsSchema),
    defaultValues: {
      ...getGenerateObligationsDefaults(),
      feeTemplateIds: recurringTemplateIds,
    },
  });

  // Update feeTemplateIds when templates change
  useEffect(() => {
    if (open) {
      form.setValue('feeTemplateIds', recurringTemplateIds);
    }
  }, [open, recurringTemplateIds, form]);

  // Reset dialog when closed
  useEffect(() => {
    if (!open) {
      setStep('configure');
      setResult(null);
      form.reset({
        ...getGenerateObligationsDefaults(),
        feeTemplateIds: recurringTemplateIds,
      });
    }
  }, [open, form, recurringTemplateIds]);

  const watchedTemplateIds = form.watch('feeTemplateIds');
  const selectedTemplateCount = watchedTemplateIds?.length || 0;

  // Calculate estimated obligations
  const estimatedObligations = useMemo(() => {
    return enrolledCount * selectedTemplateCount;
  }, [enrolledCount, selectedTemplateCount]);

  const handleGenerate = async (data: GenerateObligationsFormData) => {
    setStep('generating');
    setIsGenerating(true);

    try {
      const { periodStart, periodEnd } = getPeriodDates(data.periodMonth, data.periodYear);

      const request: GenerateBulkObligationsRequest = {
        periodStart,
        periodEnd,
        dueDate: data.dueDate,
        feeTemplateIds: data.feeTemplateIds,
      };

      const response = await obligationsApiService.generateBulkObligations(classId, request);
      setResult(response);
      setStep('results');

      if (response.created > 0) {
        toast.success(`Created ${response.created} obligation${response.created !== 1 ? 's' : ''}`);
        onSuccess();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate obligations';
      toast.error(message);
      setStep('configure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    const current = form.getValues('feeTemplateIds') || [];
    if (checked) {
      form.setValue('feeTemplateIds', [...current, templateId], { shouldValidate: true });
    } else {
      form.setValue(
        'feeTemplateIds',
        current.filter((id) => id !== templateId),
        { shouldValidate: true }
      );
    }
  };

  // Render Configure Step
  const renderConfigureStep = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
        {/* Period Selection */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="periodMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Month *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Year *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Due Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="bg-white/5 border-white/10 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fee Templates Selection */}
        <FormField
          control={form.control}
          name="feeTemplateIds"
          render={() => (
            <FormItem>
              <FormLabel className="text-white">Fee Templates *</FormLabel>
              <div className="border border-white/10 rounded-lg bg-white/5 max-h-[200px] overflow-y-auto">
                {feeTemplates.length === 0 ? (
                  <div className="p-4 text-center text-white/50">
                    No fee templates available. Create a fee template first.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {feeTemplates.map((template) => {
                      const isChecked = watchedTemplateIds?.includes(template.id) || false;
                      return (
                        <label
                          key={template.id}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleTemplateToggle(template.id, checked === true)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {template.name}
                            </div>
                            <div className="text-white/50 text-sm flex items-center gap-2">
                              <span>{template.amount.toLocaleString()} MKD</span>
                              {template.isRecurring && (
                                <span className="text-blue-400 text-xs">Recurring</span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview Info Panel */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-sm text-white/70 space-y-1">
            <div className="flex justify-between">
              <span>Enrolled students:</span>
              <span className="text-white font-medium">{enrolledCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Templates selected:</span>
              <span className="text-white font-medium">{selectedTemplateCount}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span>Estimated obligations:</span>
              <span className="text-yellow-400 font-semibold">~{estimatedObligations}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={feeTemplates.length === 0 || selectedTemplateCount === 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            Generate
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // Render Generating Step
  const renderGeneratingStep = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
      <div className="text-center">
        <p className="text-white font-medium">Generating obligations...</p>
        <p className="text-white/60 text-sm">This may take a moment</p>
      </div>
    </div>
  );

  // Render Results Step
  const renderResultsStep = () => {
    if (!result) return null;

    const hasErrors = result.errors > 0;
    const hasSkipped = result.skipped > 0;

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{result.created}</span>
              </div>
              <div className="text-white/60 text-sm">Created</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{result.skipped}</span>
              </div>
              <div className="text-white/60 text-sm">Skipped</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{result.errors}</span>
              </div>
              <div className="text-white/60 text-sm">Errors</div>
            </div>
          </div>
        </div>

        {/* Details (if there are skipped or errors) */}
        {(hasSkipped || hasErrors) && result.details.length > 0 && (
          <div>
            <h4 className="text-white/80 text-sm font-medium mb-2">Details</h4>
            <ScrollArea className="max-h-[200px]">
              <div className="border border-white/10 rounded-lg divide-y divide-white/10 bg-white/5">
                {result.details
                  .filter((d) => d.status !== 'created')
                  .map((detail, index) => (
                    <div key={index} className="p-3 flex items-start gap-3">
                      {detail.status === 'skipped' ? (
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {detail.studentName}
                        </div>
                        {detail.reason && (
                          <div className="text-white/50 text-xs">{detail.reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleClose}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            Done
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={step === 'generating' ? undefined : onOpenChange}>
      <DialogContent className="bg-[#1a1f2e] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-yellow-400" />
            Generate Obligations
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {step === 'configure' && `Generate monthly payment obligations for ${className}`}
            {step === 'generating' && 'Please wait while obligations are being generated'}
            {step === 'results' && 'Generation complete'}
          </DialogDescription>
        </DialogHeader>

        {step === 'configure' && renderConfigureStep()}
        {step === 'generating' && renderGeneratingStep()}
        {step === 'results' && renderResultsStep()}
      </DialogContent>
    </Dialog>
  );
}
