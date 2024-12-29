
type WebSocketMessageHandler<T> = (data: T) => void;

const createWebSocket = <T>(
  url: string,
  onMessage: WebSocketMessageHandler<T>,
  onError?: (error: Event) => void,
  onClose?: (retries: number) => void) => {

    let socket: WebSocket | null = null;
    let retries = 0;
    const maxRetries = 5;
  
    const connect = () => {
      socket = new WebSocket(url);
  
      socket.onopen = () => {
        console.log('WebSocket connection established');
        retries = 0;
      };
  
      socket.onmessage = (event) => {
        try {
          const data: T = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        onError?.(error)
      };
  
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        if (retries < maxRetries) {
          retries++;
          setTimeout(connect, 10000); // Try to reconnect every 10 seconds
        } else {
          console.error('Max retries reached. WebSocket connection failed.');

        }
        onClose?.(retries)
      };
    };
  
    connect();
  
    return {
      send: (message: any) => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(message);
        } else {
          console.error('WebSocket is not open. Message not sent:', message);
        }
      },
      close: () => {
        socket?.close();
      },
    };
  };
  
  export default createWebSocket;