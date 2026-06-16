import { TripsProvider } from "@/contexts/TripsContext";
import { DriveTripLogger } from "@/components/trips/DriveTripLogger";

export default function Home() {
  return (
    <TripsProvider>
      <DriveTripLogger />
    </TripsProvider>
  );
}
