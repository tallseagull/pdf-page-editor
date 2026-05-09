import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Document, Page } from 'react-pdf';
import type { PdfPage, PdfSource } from '../types.ts';

interface SortableThumbProps {
  page: PdfPage;
  source: PdfSource;
  position: number;
  isSelected: boolean;
  multiSource: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableThumb({
  page,
  source,
  position,
  isSelected,
  multiSource,
  onSelect,
  onDelete,
}: SortableThumbProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.instanceId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid-item${isSelected ? ' grid-item--selected' : ''}${isDragging ? ' grid-item--dragging' : ''}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <div className="grid-item__thumb">
        <Document
          file={source.url}
          loading={<div className="grid-item__loading" />}
          error={<div className="grid-item__loading" />}
        >
          <Page
            pageNumber={page.pageNumber}
            width={180}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<div className="grid-item__loading" />}
          />
        </Document>
      </div>
      <span className="grid-item__label">
        {position}
        {multiSource && (
          <span className="grid-item__source-hint"> · p{page.pageNumber}</span>
        )}
      </span>
      <button
        type="button"
        className="grid-item__delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Delete page at position ${position}`}
        title="Delete page"
      >
        ✕
      </button>
    </div>
  );
}

interface ThumbnailGridProps {
  sources: Map<string, PdfSource>;
  pages: PdfPage[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onReorder: (newPages: PdfPage[]) => void;
}

export default function ThumbnailGrid({
  sources,
  pages,
  selectedIdx,
  onSelect,
  onDelete,
  onReorder,
}: ThumbnailGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const multiSource = sources.size > 1;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.instanceId === active.id);
    const newIndex = pages.findIndex((p) => p.instanceId === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(pages, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={pages.map((p) => p.instanceId)}
        strategy={rectSortingStrategy}
      >
        <div className="thumb-grid">
          {pages.map((page, idx) => {
            const source = sources.get(page.sourceId);
            if (!source) return null;
            return (
              <SortableThumb
                key={page.instanceId}
                page={page}
                source={source}
                position={idx + 1}
                isSelected={idx === selectedIdx}
                multiSource={multiSource}
                onSelect={() => onSelect(idx)}
                onDelete={() => onDelete(idx)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
