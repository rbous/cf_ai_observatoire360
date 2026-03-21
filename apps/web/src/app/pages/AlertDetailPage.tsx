import { useParams } from "react-router-dom";
import { AlertDetail } from "@/app/components/dashboard/AlertDetail";

export default function AlertDetailPage() {
    const { id } = useParams<{ id: string }>();
    return <AlertDetail alertId={id ?? "ALT-001"} />;
}
