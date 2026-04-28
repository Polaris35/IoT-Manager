import { useSearchParams } from "react-router";
import { AddDeviceModal } from "./ AddDeviceModal";
import { DASHBOARD_MODALS } from "../constants";

export function AddActionsModalManager() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeModal = searchParams.get("modal");

  const onClose = () => {
    setSearchParams((prev) => {
      prev.delete("modal");
      return prev;
    });
  };

  return (
    <>
      <AddDeviceModal
        isOpen={activeModal === DASHBOARD_MODALS.ADD_DEVICE}
        onClose={onClose}
      />
    </>
  );
}
