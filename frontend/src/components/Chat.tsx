import { useEffect, useRef, useState } from "react";
import { Box, Input, IconButton, Stack, Flex, useToast } from "@chakra-ui/react";
import { FaPaperPlane } from "react-icons/fa";
import { MessageType } from "../utils/types";
import io from "socket.io-client";
import { BASE_URL } from "../utils/url";
import "../App.css";
import { getUrl } from "../utils/getUrl";
import { MdOutlineFileUpload } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";

const socket = io(BASE_URL);

const Chat = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      if (e.target.files) {
        //push and
        const file = e.target.files[0]
        if(!file.type.includes('audio') && !file.type.includes('video')){
          toast({
            position: "top",
            title: "Invalid file type",
            description: "Only audio and video files are allowed",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        const url = await getUrl(e.target.files[0], "video");
        setUrl(url);
        setFile(e.target.files[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const appendMessage = (message: MessageType) => {
    setMessages((prev) => [...prev, message]);
  };
  const handleSendMessage = () => {
    const message: MessageType = {
      text: newMessage,
      type: "outgoing",
    };
    if (url !== "" && file !== null) {
      message.url = url;
      message.ext = file.type;
    }
    appendMessage(message);
    socket.emit("message", message);
    setNewMessage("");
    setFile(null);
    setUrl("");
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (newMessage.trim() === "") return;
        handleSendMessage();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [newMessage]);

  useEffect(() => {
    socket.emit("setup");
  }, []);

  useEffect(() => {
    socket.on("message", (message: MessageType) => {
      message.type = "incoming";
      appendMessage(message);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(()=>{
    if(loading) {
      toast({
        position: "top",
        title: "Uploading file",
        status: "info",
        isClosable: true,
      });
    }
    if(loading === false && url !== ""){
      toast({
        position: "top",
        title: "File uploaded",
        description: "You can now send the file.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [loading])

  return (
    <>
      <Stack
        spacing={4}
        height={"100%"}
        display={"flex"}
        justifyContent={"center"}
      >
        <Box
          ref={scrollRef}
          border={"1px"}
          borderColor={"gray.600"}
          p={4}
          borderRadius="md"
          height="80%"
          overflowY="auto"
        >
          <Flex direction={"column"}>
            {messages.map((message, index) => (
              <Box
                key={index}
                mb={2}
                {...(message.type === "outgoing" && { ml: "auto" })}
                border={"1px"}
                borderColor={"gray.600"}
                paddingY={1}
                paddingX={4}
                width={"fit-content"}
                maxW={"50%"}
                borderRadius="xl"
              >
                {message.url !== undefined ? (
                  <>
                    {message.ext?.includes('video') ? (
                      <video
                        controls
                        style={{
                          maxWidth: "100%",
                          ...(message.type === "outgoing" && {
                            marginLeft: "auto",
                          }),
                        }}
                      >
                        <source src={message.url} type="video/mp4" />
                      </video>
                    ) : (
                      <audio
                        controls
                        style={{
                          maxWidth: "100%",
                          ...(message.type === "outgoing" && {
                            marginLeft: "auto",
                          }),
                        }}
                      >
                        <source src={message.url} type="audio/mp3" />
                      </audio>
                    )}
                  </>
                ) : (
                  message.text
                )}
              </Box>
            ))}
          </Flex>
        </Box>
        <Box>
          <Stack direction="row">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            {/* <FileUpload /> */}
            <Input
              ref={fileRef}
              type="file"
              onChange={handleFileChange}
              display={"none"}
            />
            <IconButton
              isLoading={loading}
              aria-label="Upload File"
              icon={file ? <FaCheck /> : <MdOutlineFileUpload />}
              onClick={() => fileRef.current?.click()}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={handleSendMessage}
            />
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default Chat;
