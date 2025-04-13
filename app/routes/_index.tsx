import type { MetaFunction } from "react-router";
import { headers, headers as headerUtils } from "~/headers";

// Import all components directly
import { HeroSection } from "~/components/HeroSection";
import { FeatureGrid } from "~/components/FeatureGrid";
import { AboutBlock } from "~/components/AboutBlock";

export const meta: MetaFunction = () => {
  return [
    { title: "Kiddobash | Simple & Stress-Free Kids Party Planning & Invites" },
    { name: "description", content: "Plan your child's next birthday party effortlessly with Kiddobash! Create beautiful invites, track RSVPs easily, and coordinate your event. Free & simple party planning." },
  ];
};

export async function loader() {
    return new Response(JSON.stringify({}), {
        headers: headers(),
    });
}

export default function Index() {
    return (
        <>
            <main className="flex flex-col min-h-screen">
                {/* Render all components directly without Suspense */}
                <div className="contents">
                    <HeroSection />
                </div>
                
                <div>
                    <FeatureGrid />
                </div>
                
                <div>
                    <AboutBlock />
                </div>
            </main>
        </>
    );
}
