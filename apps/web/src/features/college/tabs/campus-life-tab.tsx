import { College } from "../types";
import { CollapsibleSection } from "../components";

function TextBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

export function CampusLifeTab({ college }: { college: College }) {
  const hasAnyData =
    college.greekLife ||
    college.politicalAndSocialClimate ||
    college.safetyAndCrime ||
    college.healthAndWellbeing ||
    college.gymAndHealth;

  if (!hasAnyData) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-sm">Campus life information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greek Life */}
      {college.greekLife && (
        <CollapsibleSection title="Greek Life">
          <TextBlock>{college.greekLife}</TextBlock>
        </CollapsibleSection>
      )}

      {/* Political & Social Climate */}
      {college.politicalAndSocialClimate && (
        <CollapsibleSection title="Political & Social Climate">
          <TextBlock>{college.politicalAndSocialClimate}</TextBlock>
        </CollapsibleSection>
      )}

      {/* Safety & Security */}
      {college.safetyAndCrime && (
        <CollapsibleSection title="Safety & Security">
          <TextBlock>{college.safetyAndCrime}</TextBlock>
        </CollapsibleSection>
      )}

      {/* Health & Wellbeing */}
      {(college.healthAndWellbeing || college.gymAndHealth) && (
        <CollapsibleSection title="Health & Wellbeing">
          <div className="space-y-4">
            {college.healthAndWellbeing && (
              <TextBlock>{college.healthAndWellbeing}</TextBlock>
            )}
            {college.gymAndHealth && (
              <TextBlock>{college.gymAndHealth}</TextBlock>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
