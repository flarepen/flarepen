import * as paths from './paths';

function createIcon(path: string) {
  return function ({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        width={15}
        height={15}
        viewBox="0 0 15 15"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d={path} />
      </svg>
    );
  };
}

export const ArrowIcon = createIcon(paths.arrow);
export const SquareIcon = createIcon(paths.square);
export const LineIcon = createIcon(paths.line);
export const TextIcon = createIcon(paths.text);
export const SelectIcon = createIcon(paths.select);
export const ClipboardCopyIcon = createIcon(paths.clipboard_copy);
export const DeleteIcon = createIcon(paths.trash);
export const SunIcon = createIcon(paths.sun);
export const MoonIcon = createIcon(paths.moon);
export const AlignLeftIcon = createIcon(paths.align_left);
export const AlignRightIcon = createIcon(paths.align_right);
export const AlignCenterXIcon = createIcon(paths.align_center_x);
export const AlignTopIcon = createIcon(paths.align_top);
export const AlignBottomIcon = createIcon(paths.align_bottom);
export const AlignCenterYIcon = createIcon(paths.align_center_y);
export const GroupIcon = createIcon(paths.group);

export * from './UndoIcon';
export * from './RedoIcon';
export * from './GridIcon';
export * from './ExportIcon';
export * from './ImportIcon';
