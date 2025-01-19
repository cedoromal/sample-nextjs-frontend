import { Button, ButtonProps } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

export default function ConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  message,
  onConfirm = () => {},
  isBusy = false,
  confirmColor,
  // confirmText,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  isBusy?: boolean;
  confirmColor?: ButtonProps["color"];
  // confirmText?: string;
}) {
  return (
    <>
      <Modal
        hideCloseButton
        isDismissable={!isBusy}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p>{message}</p>
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={isBusy} variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color={confirmColor}
                  isDisabled={isBusy}
                  onPress={() => onConfirm()}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
