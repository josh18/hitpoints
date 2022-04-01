import { rgba } from 'polished';
import { ReactNode, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const TabList = styled.div`
    position: relative;
    display: flex;
    border-bottom: 2px solid ${rgba('#000', 0.16)};
`;

const Tab = styled.button`
    padding: 12px 24px;

    &:hover,
    &:focus-visible {
        background-color: ${rgba('#000', 0.08)};
    }
`;

const ActiveTabLine = styled.div<{ $x: number; $width: number; }>`
    position: absolute;
    bottom: -2px;
    height: 2px;
    width: ${props => props.$width}px;
    background-color: ${props => props.theme.primary};
    transition: ${props => props.theme.transition('transform', 'width')};
    transform: translateX(${props => props.$x}px);
`;

const TabPanels = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0px, 1fr);
    overflow: hidden;
`;

const TabPanelContainer = styled.div<{ x: number; transition: boolean; }>`
    grid-row-start: 1;
    grid-column-start: 1;
    padding: 32px;

    ${({ x }) => !!x && css`
        transform: translateX(${x}%);
    `}

    ${({ transition }) => transition && css`
        transition: ${props => props.theme.transition('transform')};
    `}
`;

interface TabPanelProps {
    index: number;
    activeTab: number;
    children: ReactNode;
}

function TabPanel({ index, activeTab, children }: TabPanelProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    let x = 0;
    if (index < activeTab) {
        x = -100;
    } else if (index > activeTab) {
        x = 100;
    }

    let transition = false;
    if (activeTab === index) {
        transition = true;
    } else if (ref.current) {
        const translateX = new DOMMatrix(window.getComputedStyle(ref.current).transform).e;

        // If the panel is currently visible then we transition to its next position
        if (Math.abs(translateX) < ref.current.offsetWidth) {
            transition = true;
        }
    }

    return (
        <TabPanelContainer
            ref={ref}
            x={x}
            transition={transition}
            role="tabpanel"
            id={contentId(index)}
            aria-labelledby={tabId(index)}
        >{children}</TabPanelContainer>
    );
}

export interface TabsProps {
    tabs: Array<{
        name: string;
        children: ReactNode;
    }>;
}

export function Tabs({ tabs }: TabsProps) {
    const tabElements = useRef<Array<HTMLElement | null>>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [activeWidth, setActiveWidth] = useState(0);
    const [activeX, setActiveX] = useState(0);

    const setTabRef = (index: number) => (element: HTMLElement | null) => {
        tabElements.current[index] = element;

        const nextActiveX = tabElements.current.slice(0, activeTab).reduce((x, element) => {
            if (element) {
                x += element.offsetWidth;
            }

            return x;
        }, 0);

        setActiveX(nextActiveX);

        if (activeTab === index && element) {
            setActiveWidth(element.offsetWidth);
        }
    };

    return (
        <>
            <TabList role="tablist">
                {tabs.map(({ name }, index) => (
                    <Tab
                        ref={setTabRef(index)}
                        onClick={() => setActiveTab(index)}
                        id={tabId(index)}
                        role="tab"
                        aria-controls={contentId(index)}
                        aria-selected={activeTab === index}
                        key={name}
                    >{name}</Tab>
                ))}

                <ActiveTabLine $width={activeWidth} $x={activeX} />
            </TabList>

            <TabPanels>
                {tabs.map(({ name, children }, index) => <TabPanel index={index} activeTab={activeTab} key={name}>{children}</TabPanel>)}
            </TabPanels>
        </>
    );
}

function tabId(index: number) {
    return 'tab-' + index;
}

function contentId(index: number) {
    return 'content-' + index;
}
