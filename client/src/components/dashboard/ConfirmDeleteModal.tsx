import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

export function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
        </DialogHeader>
        <div className="mb-4">คุณต้องการลบรายการนี้จริงหรือไม่?</div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            ลบ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
