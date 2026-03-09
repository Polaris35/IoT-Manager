import type { AddButtonProps } from "./AddButton";
import { useAddActions } from "./useAddActions";

export function withAddActions<T extends AddButtonProps>(
  Component: React.ComponentType<T>,
) {
  return function WrappedComponent(props: Omit<T, keyof AddButtonProps>) {
    const { handleAddDevice, handleCreateGroup } = useAddActions();

    return (
      <Component
        {...(props as T)}
        onAddDevice={handleAddDevice}
        onCreateGroup={handleCreateGroup}
      />
    );
  };
}
