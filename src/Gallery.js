import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

const SortableItem = ({ id, url, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card"
    >
      <button
        className="delete-btn"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => onDelete(id)}
      >
        &times;
      </button>
      <img src={url} alt="gallery-item" />
    </div>
  );
};

const Gallery = ({ images, setImages }) => {
  const [activeId, setActiveId] = useState(null);
  
  // Sensors to detect mouse and touch interactions
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDelete = async (id) => {
    const image = images.find((item) => item.id === id);
    if (!image) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "photos", id));

      // 2. Delete from Storage
      const imageRef = ref(storage, image.url);
      await deleteObject(imageRef);

      // 3. Update local state
      setImages((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid">
          {images.map((image) => (
            <SortableItem
              key={image.id}
              id={image.id}
              url={image.url}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>

      {/* DragOverlay renders the item being dragged on top of everything */}
      <DragOverlay>
        {activeId ? (
          <div className="card" style={{ cursor: 'grabbing' }}>
             <img 
               src={images.find(i => i.id === activeId)?.url} 
               alt="drag-overlay" 
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
             />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Gallery;
