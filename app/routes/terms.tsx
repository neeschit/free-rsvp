import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms & Disclaimer - Kiddobash" },
    { name: "description", content: "Terms of use and disclaimer for Kiddobash." },
  ];
};

export default function Terms() {
  return (
    <>
      <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        <div className="flex-grow container mx-auto px-6 py-16 max-w-3xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 mb-10 border border-gray-100 dark:border-gray-800">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">Terms & Disclaimer</h1>
            
            <div className="space-y-6">
              <ul className="space-y-5">
                {[
                  "Kiddobash is a free tool created to help parents plan and manage children's parties with ease.",
                  "Kiddobash does not collect or sell personal data beyond what is required for RSVP functionality.",
                  "All event data is publicly accessible right now, but is not crawleable to bots.",
                  "Kiddobash is not responsible for the actions of event attendees or the outcomes of events.",
                  "All content (themes, invites, illustrations) is for personal, non-commercial use only.",
                  "Terms may be updated over time and will be reflected here."
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mr-3 flex-shrink-0 mt-0.5">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm text-right">
                  Last updated: 3/29/2025
                </p>
              </div>
            </div>
          </div>
        </div>  
      </main>
    </>
  );
} 