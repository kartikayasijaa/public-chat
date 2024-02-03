export type MessageType = {
  text: string;
  type: 'incoming' | 'outgoing';
  url?: string;
  ext?: string;
}

export type UserType = {
  name: string
}