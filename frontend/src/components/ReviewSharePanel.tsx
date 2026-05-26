import { useState } from "react";

import { disableReviewSharing, enableReviewSharing } from "../api/client";
import { requestErrorMessage } from "../utils";

interface ReviewSharePanelProps {
  initialShareUrl: string | null;
  initiallyShareable: boolean;
  reviewId: string;
}

export function ReviewSharePanel({
  initialShareUrl,
  initiallyShareable,
  reviewId,
}: ReviewSharePanelProps) {
  const [isShareable, setIsShareable] = useState(initiallyShareable);
  const [shareUrl, setShareUrl] = useState(initialShareUrl);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSharing = async () => {
    setUpdating(true);
    setError(null);
    setCopied(false);

    try {
      if (isShareable) {
        await disableReviewSharing(reviewId);
        setIsShareable(false);
        setShareUrl(null);
      } else {
        const response = await enableReviewSharing(reviewId);
        setIsShareable(true);
        setShareUrl(response.shareUrl);
      }
    } catch (requestError) {
      setError(requestErrorMessage(requestError));
    } finally {
      setUpdating(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await window.navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setError(null);
    } catch {
      setError("Unable to copy the link. Select and copy it manually.");
    }
  };

  return (
    <section className="panel relative mb-xl overflow-hidden border border-primary/20 p-lg">
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
      <div className="flex flex-col justify-between gap-md sm:flex-row sm:items-start">
        <div>
          <p className="label-caps mb-sm font-semibold text-primary">SHARE THIS REVIEW</p>
          <p className="text-body-md text-secondary">
            Create a public, read-only link for this completed review.
          </p>
        </div>
        <button
          aria-pressed={isShareable}
          className={isShareable ? "button-ghost shrink-0" : "button-primary shrink-0"}
          disabled={updating}
          onClick={() => void toggleSharing()}
          type="button"
        >
          {updating ? "Updating..." : isShareable ? "Disable sharing" : "Enable sharing"}
        </button>
      </div>

      {isShareable && shareUrl ? (
        <div className="mt-md flex flex-col gap-sm sm:flex-row">
          <input
            aria-label="Public review link"
            className="field min-w-0 flex-1"
            readOnly
            value={shareUrl}
          />
          <button className="button-ghost shrink-0" onClick={() => void copyLink()} type="button">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : (
        <p className="mt-md font-mono text-code-sm text-outline">
          Sharing is off. Enable it to create a public link.
        </p>
      )}

      {error && <p className="mt-md text-body-sm text-error">{error}</p>}
    </section>
  );
}
