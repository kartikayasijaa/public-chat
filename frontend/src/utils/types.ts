export type MessageType = {
  text: string;
  type: 'incoming' | 'outgoing';
  url?: string;
  ext?: extType
} 
export type extType = 'mp3' | 'wav' | 'mp4' | 'aac' | 'm4a';

export type UserType = {
  name: string
}