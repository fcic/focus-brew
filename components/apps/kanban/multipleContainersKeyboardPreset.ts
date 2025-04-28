import { KeyboardCoordinateGetter } from "@dnd-kit/core";

export const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context }
) => {
  const { active, droppableContainers, droppableRects } = context;
  const { key } = event;

  if (!active || !droppableContainers.length) {
    return;
  }

  const activeIndex = droppableContainers.findIndex(
    ({ id }) => id === active.id
  );

  const activeContainer = droppableContainers.find(
    ({ id }) => id === active.data.current?.sortable.containerId
  );

  const activeContainerIndex = droppableContainers.findIndex(
    ({ id }) => id === activeContainer?.id
  );

  switch (key) {
    case "ArrowRight": {
      const nextContainerIndex = activeContainerIndex + 1;
      if (nextContainerIndex < droppableContainers.length) {
        const nextContainer = droppableContainers[nextContainerIndex];
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
        const nextContainer = droppableContainers[nextContainerIndex];
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
      if (nextIndex < droppableContainers.length) {
        const nextContainer = droppableContainers[nextIndex];
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
        const nextContainer = droppableContainers[nextIndex];
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
