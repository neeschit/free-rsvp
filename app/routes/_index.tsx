import type { MetaFunction } from "react-router";
import { headers } from "~/headers";
import { Link } from "react-router";

import { Header } from "~/components/Header";
import { HeroSection } from "~/components/HeroSection";
import { FeatureGrid } from "~/components/FeatureGrid";
import { AboutBlock } from "~/components/AboutBlock";

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
                <HeroSection />
                <FeatureGrid />
                <AboutBlock />
            </main>
        </>
    );
}
