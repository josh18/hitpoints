import styled from '@emotion/styled';

// https://www.w3.org/WAI/tutorials/forms/labels/#note-on-hiding-elements
export const VisuallyHidden = styled.div`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
`;
