import _ from 'lodash';
import { ChangeEvent, useRef } from 'react';
import { X_SCALE, Y_SCALE } from '../../constants';
import * as g from '../../geometry';
import { useStore, actions } from '../../state';
import Button from '../Button';
import { ClipboardCopyIcon, GroupIcon, ExportIcon, ImportIcon, DeleteIcon } from '../icons';

export function ExportImportButtons(): JSX.Element {
  const elements = useStore((state) => state.elements);
  const inputRef = useRef<any>(null);

  let exportFile: string | null = null;

  function handleExport() {
    const data = JSON.stringify(
      _.map(elements, (e) => {
        return {
          ..._.omit(e, ['labelEnabled', 'shape']),
          x: e.x / X_SCALE,
          y: e.y / Y_SCALE,
        };
      })
    );

    if (exportFile !== null) {
      window.URL.revokeObjectURL(exportFile);
    }

    exportFile = window.URL.createObjectURL(new Blob([data], { type: 'text/plain' }));

    let tempLink = document.createElement('a');
    tempLink.setAttribute('download', 'flare-diagram.json');
    tempLink.href = exportFile;
    document.body.appendChild(tempLink);

    window.requestAnimationFrame(function () {
      tempLink.dispatchEvent(new MouseEvent('click'));
      document.body.removeChild(tempLink);
    });
  }

  function triggerInput(e: any) {
    inputRef && inputRef.current.dispatchEvent(new MouseEvent('click'));
    e.stopPropagation();
  }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.target.files &&
      e.target.files[0].text().then((data) => {
        let elements = JSON.parse(data);
        console.log(elements);
        actions.importToCanvas(elements);
      });
    e.stopPropagation();
    e.target.value = '';
  }

  return (
    <>
      <ToolTip toolTip="Export">
        <Button onClick={handleExport}>
          <ExportIcon />
        </Button>
      </ToolTip>
      <ToolTip toolTip="Import">
        <Button onClick={triggerInput}>
          <ImportIcon />
          <input
            name="import"
            id="import"
            type="file"
            style={{ border: 'none', opacity: 0, width: 0, height: 0 }}
            accept=".json"
            ref={inputRef}
            onChange={handleImport}
          />
        </Button>
      </ToolTip>
    </>
  );
}
import ToolTip from '../ToolTip';

function ActionGroup(): JSX.Element {
  const elements = useStore((state) => state.elements);
  const groups = useStore((state) => state.groups);

  const selectedIds = useStore((state) => state.selectedIds);
  const selectedGroupIds = useStore((state) => state.selectedGroupIds);

  const canGroup = selectedGroupIds.length === 0 && selectedIds.length > 1;
  const canUngroup = selectedGroupIds.length !== 0;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => console.log(text),
      () => console.log('copy failed')
    );
  }

  function handleCopy() {
    let elementsToCopy = [];

    if (selectedIds.length + selectedGroupIds.length > 0) {
      elementsToCopy = _.map(selectedIds, (selectedId) => elements[selectedId]);

      const groupElements = _.flatMap(selectedGroupIds, (groupId) => {
        return _.map(groups[groupId].elementIds, (elementId) => elements[elementId]);
      });

      elementsToCopy = elementsToCopy.concat(groupElements);
    } else {
      elementsToCopy = _.values(elements);
    }

    const merged = g.merge(elementsToCopy);
    copyToClipboard(_.map(merged.content, (row) => row.join('')).join('\n'));
  }

  function group() {
    canGroup && actions.group();
    canUngroup && actions.ungroup();
  }

  function handleDelete() {
    if (selectedIds.length + selectedGroupIds.length === 0) {
      return null;
    }

    actions.deleteAllSelected();
    actions.unSelectAll();
  }

  return (
    <>
      <ToolTip toolTip="Delete">
        <Button
          onClick={handleDelete}
          inactive={selectedIds.length + selectedGroupIds.length === 0}
        >
          <DeleteIcon />
        </Button>
      </ToolTip>
      <ToolTip toolTip="Group">
        <Button onClick={group} inactive={!canGroup && !canUngroup}>
          <GroupIcon />
        </Button>
      </ToolTip>
      <ToolTip toolTip="Copy to clipboard">
        <Button onClick={handleCopy}>
          <ClipboardCopyIcon />
        </Button>
      </ToolTip>
    </>
  );
}

export default ActionGroup;
