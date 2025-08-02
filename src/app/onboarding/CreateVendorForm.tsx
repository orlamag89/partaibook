"use client";

import { useState, useEffect, useRef } from "react";
import AirbnbCalendar from "@/components/ui/AirbnbCalendar";
import Image from "next/image";
import r2Client from "@/lib/r2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { Spinner } from "@/components/ui/spinner"; // Assume a spinner component exists or create one

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CreateVendorForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    user_id: "",
    uploads: [] as string[],
    videoUrl: "",
    igBio: null as File | null,
    availability: "",
    unavailableDates: [] as Date[],
    calendarScreenshot: null as File | null,
    price: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [aiProfile, setAiProfile] = useState(false);
  // Removed unused uploadProgress state
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError((prev) => [...prev, "Could not get user. Please log in."]);
      } else {
        setFormData((prev) => ({ ...prev, user_id: user.id }));
      }
    };
    fetchUser();
  }, []);

  // Reset error state when changing steps
  useEffect(() => {
    setError([]);
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFile = (file: File, type: "photo" | "igBio" | "calendar") => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = type === "photo" ? ["image/jpeg", "image/png"] : ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return `Invalid ${type === "photo" ? "photo" : type === "igBio" ? "IG Bio" : "calendar screenshot"} type. Use ${validTypes.join(", ")}.`;
    }
    if (file.size > maxSize) {
      return `${type === "photo" ? "Photo" : type === "igBio" ? "IG Bio" : "Calendar screenshot"} exceeds 10MB.`;
    }
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).slice(0, 10);
    const errors = newFiles.map(file => validateFile(file, "photo")).filter(Boolean);
    if (errors.length > 0) {
      setError((prev) => [...prev, ...errors]);
      return;
    }
    setFiles(newFiles);
  };

  const handleIgBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "igBio");
      if (error) {
        setError((prev) => [...prev, error]);
        return;
      }
      setFormData((prev) => ({ ...prev, igBio: file }));
    } else {
      setFormData((prev) => ({ ...prev, igBio: null }));
    }
  };

  const handleCalendarScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "calendar");
      if (error) {
        setError((prev) => [...prev, error]);
        return;
      }
      setFormData((prev) => ({ ...prev, calendarScreenshot: file }));
    } else {
      setFormData((prev) => ({ ...prev, calendarScreenshot: null }));
    }
  };

  const handleUnavailableDateChange = (dates: Date[]) => {
    setFormData((prev) => ({
      ...prev,
      unavailableDates: dates,
    }));
  };

  const uploadToR2 = async (file: File, keyPrefix: string) => {
    const key = `${keyPrefix}/${Date.now()}_${file.name}`;
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: file.type,
    });
    try {
      await r2Client.send(command);
      return `${process.env.NEXT_PUBLIC_R2_ENDPOINT}/${process.env.NEXT_PUBLIC_R2_BUCKET}/${key}`;
    } catch {
      throw new Error("Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError([]);
    setSuccess(false);

    const validationErrors = [];
    if (!formData.name) validationErrors.push("Vendor name is required.");
    if (!formData.category) validationErrors.push("Category is required.");
    if (formData.category.startsWith("Other") && !customSubcategory) validationErrors.push("Custom subcategory is required for 'Other' category.");
    if (!formData.location) validationErrors.push("Location is required.");
    if (!formData.price) validationErrors.push("Price is required.");
    if (!formData.description) validationErrors.push("Description is required.");
    if (validationErrors.length > 0) {
      setError(validationErrors);
      setLoading(false);
      return;
    }

    try {
      if (!formData.user_id) {
        setError((prev) => [...prev, "User not authenticated. Please log in."]);
        setLoading(false);
        return;
      }
      const uploadedFiles: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const url = await uploadToR2(file, formData.user_id);
          uploadedFiles.push(url);
        }
      }
      let calendarScreenshotUrl = null;
      if (formData.calendarScreenshot) {
        calendarScreenshotUrl = await uploadToR2(formData.calendarScreenshot, formData.user_id);
      }
      let igBioUrl = null;
      if (formData.igBio) {
        igBioUrl = await uploadToR2(formData.igBio, formData.user_id);
      }
      const { error: insertError } = await supabase.from("vendors").insert({
        ...formData,
        category: formData.category.startsWith("Other") ? `Other > ${customSubcategory}` : formData.category,
        uploads: uploadedFiles,
        unavailable_dates: formData.unavailableDates.map((d) => d.toISOString()),
        calendar_screenshot: calendarScreenshotUrl,
        ig_bio_url: igBioUrl,
      });
      setLoading(false);
      if (insertError) {
        setError((prev) => [...prev, "Failed to create vendor. Please try again."]);
      } else {
        setSuccess(true);
        setFormData({
          name: "",
          category: "",
          location: "",
          description: "",
          user_id: "",
          uploads: [],
          videoUrl: "",
          igBio: null,
          availability: "",
          unavailableDates: [],
          calendarScreenshot: null,
          price: "",
        });
        setFiles([]);
        setCustomSubcategory("");
        setStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError((prev) => [...prev, "Unexpected error. Please try again."]);
      setLoading(false);
    }
  };

  const categories = {
    "Cakes & Desserts": ["Custom Cakes", "Cupcakes", "Cookies", "Dessert Tables"],
    "Catering & Food": ["Full Service", "Finger Food", "Grazing Table", "Private Chef", "Food Trucks"],
    "Balloons & Decor": ["Balloon Arches", "Backdrops", "Table Decor", "Themed Styling"],
    "Entertainment": ["DJs", "Magicians", "Clowns", "Face Painters", "Dancers", "Mascots"],
    "Photography & Video": ["Photographer", "Videographer", "360 Booth", "Photobooth"],
    "Venue Hire": ["Indoor", "Outdoor", "Rooftops", "Private Rooms"],
    "Kids Activities": ["Soft Play", "Bouncy Castle", "Craft Stations", "Puppet Shows"],
    "Transport": ["Party Buses", "Limos", "Shuttle Vans", "Vintage Cars"],
    "Games & Rentals": ["Giant Games", "Arcade Machines", "Lawn Games", "Karaoke Machine"],
  };

  // Clean up object URLs for file previews
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        try {
          URL.revokeObjectURL(URL.createObjectURL(file));
        } catch {}
      });
    };
  }, [files]);

  const renderStep = () => {
    const isOtherSelected = formData.category === "Other" || formData.category.startsWith("Other");

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {error.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded" role="alert">
                {error.map((err, idx) => <p key={idx}>{err}</p>)}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">Vendor Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby="name-error"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              {!formData.name && <p id="name-error" className="text-red-600 text-xs mt-1">Vendor name is required.</p>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category.split(" > ")[0] || ""}
                onChange={(e) => {
                  const cat = e.target.value;
                  if (cat === "Other") {
                    setFormData({ ...formData, category: `Other > ${customSubcategory}` });
                  } else {
                    setFormData({ ...formData, category: cat });
                  }
                }}
                required
                aria-required="true"
                aria-describedby="category-error"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              >
                <option value="">Select a category</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {isOtherSelected && (
                <input
                  type="text"
                  value={customSubcategory}
                  onChange={(e) => {
                    setCustomSubcategory(e.target.value);
                    setFormData({ ...formData, category: `Other > ${e.target.value}` });
                  }}
                  placeholder="Enter custom subcategory"
                  required={isOtherSelected}
                  aria-required={isOtherSelected}
                  aria-describedby="subcategory-error"
                  className="mt-2 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              )}
              {!formData.category && <p id="category-error" className="text-red-600 text-xs mt-1">Category is required.</p>}
              {isOtherSelected && !customSubcategory && <p id="subcategory-error" className="text-red-600 text-xs mt-1">Custom subcategory is required.</p>}
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground">Location (Borough or Zip)</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby="location-error"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              {!formData.location && <p id="location-error" className="text-red-600 text-xs mt-1">Location is required.</p>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-foreground">Price (e.g. $150)</label>
              <input
                id="price"
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby="price-error"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              {!formData.price && <p id="price-error" className="text-red-600 text-xs mt-1">Price is required.</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">Tell us what you offer</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby="description-error"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                rows={3}
              />
              {!formData.description && <p id="description-error" className="text-red-600 text-xs mt-1">Description is required.</p>}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              aria-label={`Next to Uploads step`}
              className="w-full bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {error.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded" role="alert">
                {error.map((err, idx) => <p key={idx}>{err}</p>)}
              </div>
            )}
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-foreground">Upload Photos (up to 10)</label>
              <input
                id="photos"
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                aria-describedby="photos-instructions"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              <p id="photos-instructions" className="mt-1 text-xs text-primary">Menu, portfolio, past work, or venue space (max 10MB each)</p>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative">
                      <Image src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} width={100} height={100} className="rounded-md" />
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {files.length > 5 && <p className="text-xs text-primary">+{files.length - 5} more</p>}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-foreground">Featured Video/IG Reel (Optional)</label>
              <input
                id="videoUrl"
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                aria-describedby="videoUrl-instructions"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              <p id="videoUrl-instructions" className="mt-1 text-xs text-primary">Paste video URL</p>
            </div>
            <div>
              <label htmlFor="igBio" className="block text-sm font-medium text-foreground">Upload IG Bio/About Us (Optional)</label>
              <input
                id="igBio"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleIgBioChange}
                aria-describedby="igBio-instructions"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              <p id="igBio-instructions" className="mt-1 text-xs text-primary">We’ll parse this with AI soon! (max 10MB)</p>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                aria-label="Back to Basic Info step"
                className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                aria-label="Next to Availability step"
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {error.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded" role="alert">
                {error.map((err, idx) => <p key={idx}>{err}</p>)}
              </div>
            )}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-foreground">Are you available on weekends?</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                aria-describedby="availability-instructions"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Sometimes">Sometimes</option>
              </select>
              <p id="availability-instructions" className="mt-1 text-xs text-primary">Select your weekend availability</p>
            </div>
            <div>
              <label htmlFor="unavailableDates" className="block text-sm font-medium text-foreground">Block off unavailable dates (click to select/deselect)</label>
              <div className="mt-2">
                <AirbnbCalendar
                  value={formData.unavailableDates}
                  onChange={handleUnavailableDateChange}
                  minDate={new Date()}
                  aria-describedby="unavailableDates-instructions"
                />
              </div>
              <p id="unavailableDates-instructions" className="mt-1 text-xs text-primary">Selected: {formData.unavailableDates.map(d => d.toLocaleDateString()).join(", ") || "None"}</p>
            </div>
            <div>
              <label htmlFor="calendarScreenshot" className="block text-sm font-medium text-foreground">Screenshot of your calendar or diary</label>
              <input
                id="calendarScreenshot"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleCalendarScreenshotChange}
                aria-describedby="calendarScreenshot-instructions"
                className="mt-1 block w-full rounded-md border-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              />
              <p id="calendarScreenshot-instructions" className="mt-1 text-xs text-primary">We’ll parse this automatically. (max 10MB)</p>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                aria-label="Back to Uploads step"
                className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                aria-label="Next to Preview step"
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            {error.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded" role="alert">
                {error.map((err, idx) => <p key={idx}>{err}</p>)}
              </div>
            )}
            <h2 className="text-xl font-semibold text-foreground">Preview Your Customer Profile</h2>
            <div className="bg-background p-4 rounded-lg border border-primary/20">
              <div className="relative w-full h-64 overflow-x-auto">
                <div className="flex space-x-2 pb-4 scrollbar-hide">
                  {files.map((file, idx) => (
                    <Image key={idx} src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} width={100} height={100} className="rounded-md flex-shrink-0" />
                  ))}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex justify-center items-center gap-1">
                  {[...Array(files.length)].map((_, index) => (
                    <span
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === 0 ? "bg-foreground" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground mt-2">{formData.name}</h3>
              <p className="text-sm text-foreground/70">Category: {formData.category.split(" > ")[1]}</p>
              <p className="text-sm text-foreground/70">Location: {formData.location} - {formData.price}</p>
              <p className="text-sm text-foreground/70 line-clamp-2">{formData.description}</p>
              <p className="text-sm text-foreground/70">Availability: {formData.availability}</p>
              {formData.videoUrl && (
                <p className="text-sm text-foreground/70">Video: <a href={formData.videoUrl} target="_blank" className="text-accent">View</a></p>
              )}
            </div>
            <div>
              <label className="flex items-center text-sm text-foreground">
                <input type="checkbox" className="mr-2" checked={aiProfile} onChange={e => setAiProfile(e.target.checked)} />
                I want PartaiBook to improve my profile with AI (coming soon)
              </label>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                aria-label="Back to Availability step"
                className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                aria-label="Submit vendor profile"
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-5 h-5 inline" /> : "Submit"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.name || formData.category || files.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, files]);

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">Become a PartaiBook Vendor</h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center">
            Vendor created successfully!
          </div>
        )}
      <ol className="flex justify-between mb-6" aria-label="Form steps">
        {[1, 2, 3, 4].map((s) => (
          <li
            key={s}
            className={`w-1/4 text-center ${step === s ? "text-primary" : "text-gray-400"}`}
            aria-current={step === s ? "step" : undefined}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto ${step === s ? "bg-primary text-white" : "bg-gray-200"} flex items-center justify-center`}
              aria-label={
                s === 1
                  ? "Basic Info"
                  : s === 2
                  ? "Uploads"
                  : s === 3
                  ? "Availability"
                  : "Preview"
              }
            >
              {s}
            </div>
            <p className="text-xs mt-1">{s === 1 ? "Basic Info" : s === 2 ? "Uploads" : s === 3 ? "Availability" : "Preview"}</p>
          </li>
        ))}
      </ol>
        <form ref={formRef} onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>{renderStep()}</form>
      </div>
    </div>
  );
}