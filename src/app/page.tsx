import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to PartaiBook 🎉</h1>
      <p className="text-lg text-gray-500 mb-4 text-center">
        Plan & book life’s celebrations in minutes.
      </p>
      <Button>Get Started</Button>
    </main>
  );
}