import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

interface Body<T> {
    requestId: number;
    data: T;
}

interface RequestResponse<T> {
    requestId: number;
    data: T;
}

@WebSocketGateway()
export class ConnectionGateway {
    @SubscribeMessage('ping')
    ping(@MessageBody() { requestId }: Body<undefined>): RequestResponse<string> {
        return { requestId, data: 'pong' };
    }
}
