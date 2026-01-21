import { MapPin, Phone, Envelope, Globe } from "@phosphor-icons/react";
import { College } from "../types";
import { CollapsibleSection } from "../components";

function ContactItem({
  icon: Icon,
  children,
  href,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 py-3">
      <Icon size={24} className="text-blue-600 flex-shrink-0" />
      <span className="text-zinc-700">{children}</span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:text-blue-600 transition-colors"
      >
        {content}
      </a>
    );
  }

  return content;
}

export function ContactTab({ college }: { college: College }) {
  const hasAnyContact =
    college.address ||
    college.phone ||
    college.internationalEmail ||
    college.website;

  if (!hasAnyContact) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-sm">Contact information not available</p>
      </div>
    );
  }

  // Format phone for tel: link (remove non-numeric except +)
  const phoneLink = college.phone
    ? `tel:${college.phone.replace(/[^0-9+]/g, "")}`
    : undefined;

  // Format website URL
  const websiteUrl = college.website
    ? college.website.startsWith("http")
      ? college.website
      : `https://${college.website}`
    : undefined;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <CollapsibleSection title="Contact Information">
        <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100">
          {college.address && (
            <div className="px-4">
              <ContactItem icon={MapPin}>{college.address}</ContactItem>
            </div>
          )}
          {college.phone && (
            <div className="px-4">
              <ContactItem icon={Phone} href={phoneLink}>
                {college.phone}
              </ContactItem>
            </div>
          )}
          {college.internationalEmail && (
            <div className="px-4">
              <ContactItem
                icon={Envelope}
                href={`mailto:${college.internationalEmail}`}
              >
                {college.internationalEmail}
              </ContactItem>
            </div>
          )}
          {college.website && (
            <div className="px-4">
              <ContactItem icon={Globe} href={websiteUrl}>
                {college.website}
              </ContactItem>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
