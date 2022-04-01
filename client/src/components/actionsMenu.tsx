import { rgba } from 'polished';
import { ReactNode, useRef, useState } from 'react';
import styled from 'styled-components';

import { MenuIcon } from '../icons/menuIcon';
import { AnchorPosition, positionInViewport } from '../util/positionInViewport';
import { IconButton } from './button';
import { Card } from './card';
import { Portal } from './portal';

const MenuButton = styled(IconButton)`
    width: 36px;
`;

const MenuDropdown = styled(Card)`
    position: absolute;
    min-width: 200px;
`;

const MenuItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;

    svg {
        margin-left: -4px;
        margin-right: 8px;
        fill: ${rgba('#000', 0.5)};
    }

    &:hover {
        background-color: ${rgba('#000', 0.08)};
    }
`;

export interface MenuItem {
    icon?: ReactNode;
    name: string;
    action: () => void;
}

export interface ActionsMenuProps {
    items: MenuItem[];
}

export function Menu({ items: items }: ActionsMenuProps) {
    const buttonPosition = useRef<AnchorPosition>();
    const [open, setOpen] = useState(false);

    const toggleMenu = () => {
        setOpen(!open);
    };

    const hideMenu = () => {
        setOpen(false);
    };

    const setButtonRef = (element: HTMLButtonElement | null) => {
        if (element) {
            buttonPosition.current = element.getBoundingClientRect();
        }
    };

    const setMenuRef = (element: HTMLDivElement | null) => {
        if (element && buttonPosition.current) {
            positionInViewport(element, buttonPosition.current, 'left');
        }
    };

    let menu;
    if (open) {
        menu = (
            <MenuDropdown onMouseDown={e => e.preventDefault()} floating ref={setMenuRef} role="menu">
                {items.map(item => {
                    const onClick = () => {
                        setOpen(false);

                        item.action();
                    };

                    return <MenuItem key={item.name} onClick={onClick} role="menuitem">{item.icon}{item.name}</MenuItem>;
                })}
            </MenuDropdown>
        );
    }

    return (
        <>
            <MenuButton
                active={open}
                onClick={toggleMenu}
                onBlur={hideMenu}
                ref={setButtonRef}
                aria-label="More actions"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <MenuIcon />
            </MenuButton>

            <Portal>
                {menu}
            </Portal>
        </>
    );
}
