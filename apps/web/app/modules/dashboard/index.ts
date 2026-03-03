import AddButton from "./components/AddButton";
import { withAddActions } from "./HOCs/withAddActions";

export const SmartAddButton = withAddActions(AddButton);

export { AddButton };
