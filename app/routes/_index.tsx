import type { MetaFunction } from "react-router";
import { headers } from "~/headers";
import { Link } from "react-router";
import { Suspense, lazy } from "react";

// Immediate load for critical hero section
import { HeroSection } from "~/components/HeroSection";

// Lazy load lower-priority components
const FeatureGrid = lazy(() => import("~/components/FeatureGrid").then(module => ({ 
  default: module.FeatureGrid 
})));
const AboutBlock = lazy(() => import("~/components/AboutBlock").then(module => ({ 
  default: module.AboutBlock 
})));

export const meta: MetaFunction = () => {
  return [
    { title: "Kiddobash - Kid Birthday Party Invites" },
    { name: "description", content: "Send adorable invites, track RSVPs, and make party magic happen — all in one place." },
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
                {/* High priority content - render immediately */}
                <div className="contents">
                    <HeroSection />
                </div>
                
                {/* Lower priority content - can be loaded after initial paint */}
                <Suspense fallback={<div className="h-96"></div>}>
                    <div style={{ contentVisibility: 'auto' }}>
                        <FeatureGrid />
                    </div>
                </Suspense>
                
                <Suspense fallback={<div className="h-48"></div>}>
                    <div style={{ contentVisibility: 'auto' }}>
                        <AboutBlock />
                    </div>
                </Suspense>
            </main>
        </>
    );
}
