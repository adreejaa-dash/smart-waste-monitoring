import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertReportSchema } from "@shared/schema";
import { Upload, Camera, MapPin, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

// Form schema for client-side validation
const reportFormSchema = insertReportSchema.omit({ 
  citizenId: true, 
  citizenName: true,
  status: true,
  assignedWorkerId: true,
  priority: true,
  photoUrl: true,
  proofPhotoUrl: true
}).extend({
  wasteType: z.enum(["organic", "plastic", "recyclable", "hazardous"]),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface ClassificationResult {
  wasteType: string;
  confidence: number;
  message: string;
}

export default function SubmitReport() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      location: "",
      latitude: 20.2961, // Default to Bhubaneswar
      longitude: 85.8245,
      wasteType: "organic",
      description: "",
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const formData = new FormData();
      formData.append('reportData', JSON.stringify(data));
      
      if (selectedImage) {
        formData.append('photo', selectedImage);
      }

      // Get auth token for authenticated request
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit report' }));
        throw new Error(errorData.error || 'Failed to submit report');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep our environment clean.",
      });
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      setClassificationResult(null);
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/mine'] });
    },
    onError: () => {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Classify the image using AI
    await classifyImage(file);
  };

  const classifyImage = async (file: File) => {
    setIsClassifying(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/classify-waste', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const result: ClassificationResult = await response.json();
      setClassificationResult(result);
      
      // Auto-fill the waste type in the form
      form.setValue('wasteType', result.wasteType as any);
      
      toast({
        title: "Image classified!",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Classification failed",
        description: "Unable to classify the image automatically. Please select the waste type manually.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const onSubmit = (data: ReportFormData) => {
    submitReportMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-testid="page-submit-report"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Submit Waste Report</h2>
        <Badge variant="outline" className="text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          Bhubaneswar
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Photo Evidence</span>
              {classificationResult && (
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Classified
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Selected" 
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setClassificationResult(null);
                    }}
                    data-testid="button-remove-image"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a photo of the waste for AI classification
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      data-testid="input-image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Choose Image
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* AI Classification Result */}
            {isClassifying && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Classifying image...</span>
              </div>
            )}

            {classificationResult && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">AI Classification Result</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detected: <span className="font-medium capitalize">{classificationResult.wasteType}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(classificationResult.confidence * 100)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the exact location (e.g., Near City Mall, Unit 1)"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="20.2961"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-latitude"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="85.8245"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-longitude"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="wasteType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Waste Type
                        {classificationResult && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            AI Suggested
                          </Badge>
                        )}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-waste-type">
                            <SelectValue placeholder="Select waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="organic">Organic Waste</SelectItem>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="recyclable">Recyclable</SelectItem>
                          <SelectItem value="hazardous">Hazardous</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional details about the waste..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitReportMutation.isPending}
                  data-testid="button-submit-report"
                >
                  {submitReportMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}