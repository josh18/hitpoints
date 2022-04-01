import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 80px;

    @media (max-width: 850px) {
        font-size: 60px;
    }

    @media (max-width: 550px) {
        font-size: 40px;
        text-align: center;
    }
`;

const Haha = styled.div`
    font-size: 12px;
    margin-top: 12px;
`;

export function Error404() {
    return (
        <Container>
            <div>
                Page Not Found
                <Haha>Just like your cooking skills 🤣</Haha>
            </div>
        </Container>
    );
}
