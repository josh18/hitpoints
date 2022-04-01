import { ChangeEvent, forwardRef, useEffect, useState } from 'react';
import styled from 'styled-components';

import { CheckboxCheckedIcon } from '../icons/checkboxCheckedIcon';
import { CheckboxUncheckedIcon } from '../icons/checkboxUncheckedIcon';

const Container = styled.div`
    display: flex;
    padding-top: 4px;
    padding-bottom: 4px;
`;

const Label = styled.label`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
    margin-bottom: 0;
`;

const InputWrapper = styled.div`
    position: relative;
    display: flex;
`;

const Input = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: inherit;
    opacity: 0;
    margin: 0;
`;

const Name = styled.div`
    margin-left: 8px;
`;

interface CheckboxProps {
    name?: string;
    value: boolean;
    commit: (checked: boolean) => void;
    uncheckedIcon?: JSX.Element;
    checkedIcon?: JSX.Element;
    className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({
        name,
        value,
        commit,
        checkedIcon = <CheckboxCheckedIcon />,
        uncheckedIcon = <CheckboxUncheckedIcon />,
        className,
    },
    ref,
) => {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.checked;
        commit(next);
    };

    return (
        <Container className={className}>
            <Label>
                <InputWrapper>
                    <Input ref={ref} type="checkbox" onChange={onChange} checked={value} />
                    {value ? checkedIcon : uncheckedIcon}
                </InputWrapper>
                {name ? <Name>{name}</Name> : null}
            </Label>
        </Container>
    );
});

Checkbox.displayName = 'Checkbox';
