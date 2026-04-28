import { useSearchParams } from "react-router";
import { DASHBOARD_MODALS } from "../../constants";

export function useAddActions() {
  const [_, setSearchParams] = useSearchParams();

  return {
    handleAddDevice: () =>
      setSearchParams({ modal: DASHBOARD_MODALS.ADD_DEVICE }),
    handleCreateGroup: () =>
      setSearchParams({ modal: DASHBOARD_MODALS.CREATE_GROUP }),
  };
}
