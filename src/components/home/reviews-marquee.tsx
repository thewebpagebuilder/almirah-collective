"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitReviewAction } from "@/actions/review-actions";
import { MagneticButton } from "@/components/ui/magnetic-button";

type Review = {
  id: number;
  customerName: string;
  rating: number;
  title: string | null;
  body: string;
};

export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    const formData = new FormData(e.currentTarget);
    
    const result = await submitReviewAction(formData);
    
    if (result.success) {
      setSubmitStatus("success");
      setTimeout(() => setIsModalOpen(false), 2000);
    } else {
      setSubmitStatus("error");
    }
    setIsSubmitting(false);
  }

  // Duplicate reviews to ensure seamless marquee loop if there are too few
  const displayReviews = [...reviews, ...reviews, ...reviews].slice(0, Math.max(10, reviews.length * 2));

  return (
    <section className="relative overflow-hidden bg-pearl py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-obsidian/40">
            Real Reviews
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-obsidian md:text-5xl">
            Loved by our collective
          </h2>
        </div>
        <MagneticButton onClick={() => { setIsModalOpen(true); setSubmitStatus("idle"); }}>
          Write a Review
        </MagneticButton>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee flex gap-6 px-3 whitespace-nowrap group-hover:[animation-play-state:paused]">
          {displayReviews.map((r, idx) => (
            <div
              key={`${r.id}-${idx}`}
              className="w-[300px] md:w-[400px] shrink-0 whitespace-normal border border-obsidian/10 bg-beige/30 p-6 md:p-8"
            >
              <div className="flex text-obsidian mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-obsidian/20"}`} />
                ))}
              </div>
              {r.title && <h3 className="font-serif text-lg text-obsidian mb-2">{r.title}</h3>}
              <p className="text-sm leading-relaxed text-obsidian/70 mb-6 line-clamp-4">
                &ldquo;{r.body}&rdquo;
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-obsidian">
                — {r.customerName}
              </p>
            </div>
          ))}
        </div>
        <div className="animate-marquee flex gap-6 px-3 whitespace-nowrap absolute top-0 group-hover:[animation-play-state:paused]">
          {displayReviews.map((r, idx) => (
            <div
              key={`${r.id}-clone-${idx}`}
              className="w-[300px] md:w-[400px] shrink-0 whitespace-normal border border-obsidian/10 bg-beige/30 p-6 md:p-8"
            >
              <div className="flex text-obsidian mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-obsidian/20"}`} />
                ))}
              </div>
              {r.title && <h3 className="font-serif text-lg text-obsidian mb-2">{r.title}</h3>}
              <p className="text-sm leading-relaxed text-obsidian/70 mb-6 line-clamp-4">
                &ldquo;{r.body}&rdquo;
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-obsidian">
                — {r.customerName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-pearl p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-obsidian/50 hover:text-obsidian transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-2xl mb-6">Write a Review</h3>
            
            {submitStatus === "success" ? (
              <div className="py-8 text-center">
                <p className="text-green-700 text-lg">Thank you for your review!</p>
                <p className="text-sm text-obsidian/60 mt-2">It will be published once approved by our team.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian/60 mb-2">Name</label>
                  <input required name="customerName" type="text" className="w-full border border-obsidian/20 bg-transparent px-4 py-3 outline-none focus:border-obsidian" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian/60 mb-2">Rating</label>
                  <select name="rating" className="w-full border border-obsidian/20 bg-transparent px-4 py-3 outline-none focus:border-obsidian">
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian/60 mb-2">Title (Optional)</label>
                  <input name="title" type="text" className="w-full border border-obsidian/20 bg-transparent px-4 py-3 outline-none focus:border-obsidian" placeholder="Summary of your experience" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian/60 mb-2">Review</label>
                  <textarea required name="body" rows={4} className="w-full border border-obsidian/20 bg-transparent px-4 py-3 outline-none focus:border-obsidian resize-none" placeholder="Tell us what you loved..."></textarea>
                </div>
                {submitStatus === "error" && (
                  <p className="text-red-500 text-sm">Failed to submit review. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-obsidian py-4 text-xs font-medium uppercase tracking-[0.2em] text-pearl transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
