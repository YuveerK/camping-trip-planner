import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';

export function TripDangerZone({ isOwner, onDelete }: { isOwner: boolean; onDelete: () => void }) {
  if (!isOwner) return null;

  return (
    <div className="mt-8">
      <Card className="border-red-100">
        <CardHeader><h3 className="text-sm font-semibold text-red-600">Danger zone</h3></CardHeader>
        <CardBody>
          <p className="text-sm text-stone-500 mb-3">
            Deleting this trip will permanently remove all packing items, tasks, meals, and expenses. This cannot be undone.
          </p>
          <Button variant="danger" onClick={onDelete}>Delete trip</Button>
        </CardBody>
      </Card>
    </div>
  );
}
