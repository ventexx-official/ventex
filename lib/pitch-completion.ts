export function isPitchProfileComplete(formData: {
  title: string;
  logo_url: string;
  website_url: string;
  short_description: string;
  country: string;
  city: string;
  business_type: string;
  product_type: string;
  company_stage: string;
  founding_year: string;
  tags: string[];
}): boolean {
  const fields = [
    formData.title,
    formData.logo_url,
    formData.website_url,
    formData.short_description,
    formData.country,
    formData.city,
    formData.business_type,
    formData.product_type,
    formData.company_stage,
    formData.founding_year,
  ];
  return fields.every(Boolean) && formData.tags.length > 0;
}
