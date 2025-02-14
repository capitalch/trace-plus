import DateSelector from "@/components/DateSelector";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-primary">Date Selection</h1>
        <DateSelector />
      </div>
    </div>
  );
}
