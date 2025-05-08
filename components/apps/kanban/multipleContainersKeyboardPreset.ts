import { KeyboardCoordinateGetter, DroppableContainer } from "@dnd-kit/core";

export const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context }
) => {
  const { active, droppableContainers, droppableRects } = context;
  const { key } = event;

  if (!active || !droppableContainers.size) {
    return;
  }

  // Convert Map to Array for easier manipulation
  const containers = Array.from(droppableContainers.values());

  const activeIndex = containers.findIndex(
    (container) => container.id === active.id
  );

  const activeContainer = containers.find(
    (container) => container.id === active.data.current?.sortable.containerId
  );

  const activeContainerIndex = containers.findIndex(
    (container) => container.id === activeContainer?.id
  );

  switch (key) {
    case "ArrowRight": {
      const nextContainerIndex = activeContainerIndex + 1;
      if (nextContainerIndex < containers.length) {
        const nextContainer = containers[nextContainerIndex];
        const rect = droppableRects.get(nextContainer.id);

        if (rect) {
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + 20,
          };
        }
      }
      break;
    }
    case "ArrowLeft": {
      const nextContainerIndex = activeContainerIndex - 1;
      if (nextContainerIndex >= 0) {
        const nextContainer = containers[nextContainerIndex];
        const rect = droppableRects.get(nextContainer.id);

        if (rect) {
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + 20,
          };
        }
      }
      break;
    }
    case "ArrowDown": {
      const nextIndex = activeIndex + 1;
      if (nextIndex < containers.length) {
        const nextContainer = containers[nextIndex];
        const rect = droppableRects.get(nextContainer.id);

        if (rect) {
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }
      break;
    }
    case "ArrowUp": {
      const nextIndex = activeIndex - 1;
      if (nextIndex >= 0) {
        const nextContainer = containers[nextIndex];
        const rect = droppableRects.get(nextContainer.id);

        if (rect) {
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }
      break;
    }
  }

  return undefined;
};
