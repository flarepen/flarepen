import _ from 'lodash';
import * as g from '../../geometry';
import { useStore, actions } from '../../state';
import Button from '../Button';
import { ClipboardCopyIcon, DeleteIcon, GroupIcon } from '../icons';
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

  function handleDelete() {
    if (selectedIds.length + selectedGroupIds.length === 0) {
      return null;
    }

    actions.deleteAllSelected();
    actions.unSelectAll();
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

  return (
    <>
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
      <ToolTip toolTip="Delete">
        <Button
          onClick={handleDelete}
          inactive={selectedIds.length + selectedGroupIds.length === 0}
        >
          <DeleteIcon />
        </Button>
      </ToolTip>
    </>
  );
}

export default ActionGroup;
