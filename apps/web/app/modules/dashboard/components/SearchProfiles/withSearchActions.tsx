// import { Component } from "react";

// export function withSearchActions<T extends DeviceProfileSelectProps>(
//   Component: React.ComponentType<T>,
// ) {
//   return function WrappedComponent(
//     props: Omit<T, keyof DeviceProfileSelectProps>,
//   ) {
//     return <Component {...(props as T)} />;
//   };
// }

// // function withAddActions<T extends AddButtonProps>(
// //   Component: React.ComponentType<T>,
// // ) {
// //   return function WrappedComponent(props: Omit<T, keyof AddButtonProps>) {
// //     const { handleAddDevice, handleCreateGroup } = useAddActions();

// //     return (
// //       <Component
// //         {...(props as T)}
// //         onAddDevice={handleAddDevice}
// //         onCreateGroup={handleCreateGroup}
// //       />
// //     );
// //   };
// // }
