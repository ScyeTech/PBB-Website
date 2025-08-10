import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { UserPlus, Building2, FileText, CheckCircle, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  // Company Details
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vatNumber: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  yearsInBusiness: z.string().min(1, "Years in business is required"),
  
  // Contact Person
  contactName: z.string().min(2, "Contact name is required"),
  contactPosition: z.string().min(1, "Position is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(10, "Phone number is required"),
  
  // Company Address
  streetAddress: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  
  // Business Information
  businessType: z.string().min(1, "Business type is required"),
  targetMarkets: z.array(z.string()).min(1, "Select at least one target market"),
  averageOrderValue: z.string().min(1, "Average order value is required"),
  
  // Supporting Documents
  businessDescription: z.string().min(10, "Please provide a business description (minimum 10 characters)"),
  
  // Terms
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
  acceptTradeTerms: z.boolean().refine(val => val === true, "You must accept the trade terms"),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      targetMarkets: [],
      acceptTerms: false,
      acceptTradeTerms: false,
      acceptPrivacyPolicy: false,
    },
  });

  const targetMarkets = form.watch("targetMarkets");

  const handleTargetMarketChange = (market: string, checked: boolean) => {
    if (checked) {
      form.setValue("targetMarkets", [...targetMarkets, market]);
    } else {
      form.setValue("targetMarkets", targetMarkets.filter(m => m !== market));
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your registration API
      console.log('Registration data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registration Submitted!",
        description: "Your application has been submitted for review. We'll contact you within 2-3 business days.",
      });
      
      setStep(4); // Success step
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate company details
      const fields = ['companyName', 'registrationNumber', 'industry', 'yearsInBusiness'] as const;
      const hasErrors = fields.some(field => {
        form.trigger(field);
        return form.formState.errors[field] !== undefined;
      });
      if (hasErrors) return;
    } else if (step === 2) {
      // Validate contact and address
      const fields = ['contactName', 'contactPosition', 'contactEmail', 'contactPhone', 'streetAddress', 'city', 'province', 'postalCode'] as const;
      const hasErrors = fields.some(field => {
        form.trigger(field);
        return form.formState.errors[field] !== undefined;
      });
      if (hasErrors) return;
    }
    
    setStep(step + 1);
  };

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Registration Submitted!</h2>
          <p className="text-neutral-600 mb-6">
            Thank you for your registration application. Our team will review your submission and contact you within 2-3 business days with the next steps.
          </p>
          <div className="space-y-3">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <p className="text-sm text-neutral-500">
              You'll receive a confirmation email shortly with your application details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Become a Reseller</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Join South Africa's largest promotional products network. Complete the application below to get started.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= stepNumber 
                ? 'bg-primary text-white' 
                : 'bg-neutral-200 text-neutral-600'
            }`}>
              {stepNumber}
            </div>
            <span className={`ml-2 ${
              step >= stepNumber ? 'text-neutral-900' : 'text-neutral-500'
            }`}>
              {stepNumber === 1 && 'Company Info'}
              {stepNumber === 2 && 'Contact Details'}
              {stepNumber === 3 && 'Business Details'}
            </span>
            {stepNumber < 3 && <div className="w-8 h-px bg-neutral-300 mx-4" />}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company (Pty) Ltd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="2021/123456/07" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="4123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select years" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                              <SelectItem value="1-2">1-2 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="6-10">6-10 years</SelectItem>
                              <SelectItem value="more-than-10">More than 10 years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="promotional-products">Promotional Products</SelectItem>
                            <SelectItem value="marketing-agency">Marketing Agency</SelectItem>
                            <SelectItem value="corporate-gifts">Corporate Gifts</SelectItem>
                            <SelectItem value="uniform-supplier">Uniform Supplier</SelectItem>
                            <SelectItem value="printing-signage">Printing & Signage</SelectItem>
                            <SelectItem value="event-management">Event Management</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep}>
                      Next: Contact Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Contact Person */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Person</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position/Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Marketing Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 11 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Company Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street, Office 456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Johannesburg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select province" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="gauteng">Gauteng</SelectItem>
                                <SelectItem value="western-cape">Western Cape</SelectItem>
                                <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                                <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                                <SelectItem value="free-state">Free State</SelectItem>
                                <SelectItem value="limpopo">Limpopo</SelectItem>
                                <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                                <SelectItem value="north-west">North West</SelectItem>
                                <SelectItem value="northern-cape">Northern Cape</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="2000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next: Business Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Business Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reseller">Promotional Products Reseller</SelectItem>
                              <SelectItem value="distributor">Distributor</SelectItem>
                              <SelectItem value="agency">Marketing/Advertising Agency</SelectItem>
                              <SelectItem value="printer">Commercial Printer</SelectItem>
                              <SelectItem value="corporate">Corporate Services</SelectItem>
                              <SelectItem value="retail">Retail Business</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="text-sm font-semibold mb-3 block">Target Markets</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'Corporate Clients',
                          'Small Businesses', 
                          'Non-Profits',
                          'Educational Institutions',
                          'Government',
                          'Events & Trade Shows',
                          'Healthcare',
                          'Hospitality',
                          'Sports Clubs'
                        ].map((market) => (
                          <div key={market} className="flex items-center space-x-2">
                            <Checkbox
                              id={market}
                              checked={targetMarkets.includes(market)}
                              onCheckedChange={(checked) => handleTargetMarketChange(market, checked as boolean)}
                            />
                            <label htmlFor={market} className="text-sm cursor-pointer">
                              {market}
                            </label>
                          </div>
                        ))}
                      </div>
                      {form.formState.errors.targetMarkets && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.targetMarkets.message}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="averageOrderValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Order Value</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-1000">Under R 1,000</SelectItem>
                              <SelectItem value="1000-5000">R 1,000 - R 5,000</SelectItem>
                              <SelectItem value="5000-10000">R 5,000 - R 10,000</SelectItem>
                              <SelectItem value="10000-25000">R 10,000 - R 25,000</SelectItem>
                              <SelectItem value="25000-50000">R 25,000 - R 50,000</SelectItem>
                              <SelectItem value="over-50000">Over R 50,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your business, your experience with promotional products, and how you plan to market our products to your clients..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Terms and Agreements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed">
                            I accept the{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                              Terms and Conditions
                            </Link>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTradeTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed">
                            I accept the{" "}
                            <Link href="/trade-terms" className="text-primary hover:underline">
                              Trade Terms and Conditions
                            </Link>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptPrivacyPolicy"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed">
                            I accept the{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent-light"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Information Section */}
      {step <= 3 && (
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Application Review</h4>
                  <p className="text-sm text-neutral-600">
                    We'll review your application and verify your business credentials within 2-3 business days.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Approval & Setup</h4>
                  <p className="text-sm text-neutral-600">
                    Once approved, you'll receive login credentials and access to our trade portal.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Welcome Package</h4>
                  <p className="text-sm text-neutral-600">
                    Receive branded samples, catalogs, and marketing materials to help grow your business.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
