import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EditTaskModal from './EditTaskModal';
import './KanbanBoard.css';

const columns = ['Todo', 'In Progress', 'Done'];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const mockTasks = [
      { _id: '1', title: 'Setup project', status: 'Todo' },
      { _id: '2', title: 'Design UI', status: 'In Progress' },
      { _id: '3', title: 'Create backend', status: 'Done' }
    ];
    setTasks(mockTasks);
  }, []);

  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setSelectedTask(null);
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === draggableId ? { ...task, status: destination.droppableId } : task
      )
    );
  };

  return (
    <div className="kanban-wrapper">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container">
          {columns.map((col) => (
            <Droppable droppableId={col} key={col} isDropDisabled={false}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{col}</h3>
                  {tasks
                    .filter((task) => task.status === col)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="task-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleTaskClick(task)}
                          >
                            {task.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
