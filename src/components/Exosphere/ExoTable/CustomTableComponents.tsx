import { ExPill, PillColor, PillSize } from '@boomi/exosphere/dist/react/pill';
import { ICellRendererParams } from 'ag-grid-community';
import { createRoot, Root } from 'react-dom/client';

// Tags Cell Renderer: Display tags as ExPill components
export const TagsCellRenderer = (params: ICellRendererParams) => {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '0px';
  container.style.alignItems = 'center';
  container.style.flexWrap = 'nowrap';
  container.style.paddingBottom = '2px';
  container.style.overflow = 'hidden';
  container.style.position = 'relative';
  container.style.height = '100%';

  const tags = Array.isArray(params.value) ? params.value : [];
  const root: Root = createRoot(container);

  // Show maximum 3 pills, then "+X more"
  const maxVisiblePills = 2;
  const visibleTags = tags.slice(0, maxVisiblePills);
  const remainingCount = tags.length - maxVisiblePills;

  root.render(
    <>
      {visibleTags.map((tag: string, index: number) => (
        <div
          key={index}
          style={{
            display: 'flex',
            height: '24px',
            padding: '0 4px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ExPill color={PillColor.BLUE} size={PillSize.SMALL}>
            {tag}
          </ExPill>
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          style={{
            display: 'flex',
            height: '24px',
            padding: '0px 4px 0px 6px',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            color: 'exo-color-font-secondary',
            whiteSpace: 'nowrap',
          }}
        >
          +{remainingCount}
        </div>
      )}
    </>,
  );

  (container as any).destroy = () => root.unmount();
  return container;
};

export const createActionCellRenderer = (
  ActionComponent: React.ComponentType<{
    data: any;
    params: ICellRendererParams;
  }>,
) => {
  return (params: ICellRendererParams) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.height = '100%';

    const root: Root = createRoot(container);
    root.render(<ActionComponent data={params.data} params={params} />);

    (container as any).destroy = () => root.unmount();
    return container;
  };
};
