import { useSearchParams } from "react-router";

export function useAddActions() {
  const [_, setSearchParams] = useSearchParams();

  return {
    handleAddDevice: () => setSearchParams({ modal: "add-device" }),
    handleCreateGroup: () => setSearchParams({ modal: "create-group" }),
  };
}
