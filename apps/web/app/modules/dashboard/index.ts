import AddButton from "./AddButton/AddButton";
import { withAddActions } from "./AddButton/withAddActions";

export const SmartAddButton = withAddActions(AddButton);

export { AddButton };

export { dashboardRoutes } from "./routers";
