import React from 'react';
import { Panel, PanelContent } from './Panel';
import { styled } from '../../stitches.config';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { QuestionMarkIcon } from '../icons';

const MenuItemContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '14px',
  padding: '8px 12px',
  margin: '2px 4px',
  color: '$actionText',
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  transition: 'background-color 0.15s ease',

  '&:hover': {
    backgroundColor: '$actionBgHover',
  },
});

const MenuItemLeft = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
});

const MenuItemIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  color: '$actionText',
});

const MenuItemText = styled('span', {
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: 'Cascadia',
  color: '$actionText',
});

const MenuItemShortcut = styled('span', {
  fontSize: '12px',
  color: '$actionTextDisabled',
  marginLeft: 'auto',
});

interface MenuItemProps {
  icon?: React.ReactNode;
  text: string;
  shortcut?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, shortcut, onClick }) => {
  return (
    <MenuItemContainer onClick={onClick}>
      <MenuItemLeft>
        {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
        <MenuItemText>{text}</MenuItemText>
      </MenuItemLeft>
      {shortcut && <MenuItemShortcut>{shortcut}</MenuItemShortcut>}
    </MenuItemContainer>
  );
};

const MenuSeparator = styled('div', {
  height: '1px',
  backgroundColor: '$panelBorder',
  margin: '8px 0',
});

const PanelContentWithFooter = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const MenuSection = styled('div', {
  flex: 1,
});

const FooterSection = styled('div', {
  marginTop: 'auto',
  borderTop: '1px solid $panelBorder',
  paddingTop: '8px',
});

export function LeftPanel() {
  return (
    <Panel>
      <PanelContent>
        <PanelContentWithFooter>
          <MenuSection>
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                opacity: 0.5,
                fontSize: '12px',
              }}
            >
              Coming soon...
            </div>
          </MenuSection>

          <FooterSection>
            <MenuItem
              icon={<QuestionMarkIcon />}
              text="Help"
              shortcut="?"
              onClick={() => console.log('Help clicked')}
            />
            <MenuItem
              icon={<InfoCircledIcon />}
              text="About"
              onClick={() => console.log('About clicked')}
            />
          </FooterSection>
        </PanelContentWithFooter>
      </PanelContent>
    </Panel>
  );
}
