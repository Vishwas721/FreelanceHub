import { useDrag } from "react-dnd";
import "./DraggableWidget.css";

const DraggableWidget = ({ id, title, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "WIDGET",
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`widget ${isDragging ? "dragging" : ""}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default DraggableWidget;