import React, { useEffect, useRef, useState } from "react";
import {
  BiSearch,
  BsThreeDotsVertical,
  FiImage,
  IoMdSend,
  IoVideocamOutline,
  MdArrowBackIos,
  MdDeleteOutline,
  RxCross2,
} from "../assets";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import Loading from "./Loading";
import { getOpponentParticipant } from "../utils";
import OutsideClickHandler from "react-outside-click-handler";
import { useConnectWebRtc } from "../context/WebRtcContext";

const MessageCont = ({ isOwnMessage, isGroupChat, message }) => {
  const { deleteChatMessage } = useChat();
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  return (
    <div className={` w-full flex my-2 `}>
      <div
        className={`flex  ${
          isOwnMessage
            ? "max-w-[50%] ml-auto mr-10 md:mr-3"
            : "mr-auto ml-10 md:ml-3"
        }`}
      >
        <div
          className={`flex flex-col  justify-center relative dark:bg-opacity-20 dark:bg-primary min-w-[120px] bg-backgroundLight3  p-2 md:p-1 rounded-xl ${
            isOwnMessage ? "rounded-br-none" : "rounded-bl-none"
          } mb-5 ${isOwnMessage ? "order-2" : "order-1"}`}
        >
          {message.attachments?.length ? (
            <div className="flex gap-1 flex-wrap">
              {message.attachments?.map((file) => (
                <img
                  src={file.url}
                  loading="lazy"
                  className={`${
                    message.attachments?.length > 1 ? "size-44" : "size-72"
                  }  object-cover rounded-md`}
                />
              ))}
            </div>
          ) : (
            ""
          )}
          <p className="p-3 md:p-2 text-base md:text-md text-slate-900 dark:text-slate-100 ">
            {message.content}
          </p>

          <div className="flex items-center gap-1 text-xs dark:text-slate-400 text-slate-400 absolute bottom-0 right-1 ">
            {/* <span>
              <LuClock3 />
            </span> */}
            <span className="text-[10px]">
              {moment(message.createdAt)
                .add("TIME_ZONE", "hours")
                .fromNow(true)}{" "}
              ago
            </span>
          </div>
        </div>
        <div
          className={`mx-3 md:mx-0 ${isOwnMessage ? "order-1" : "order-2"} `}
        >
          <div className="relative cursor-pointer text-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            <OutsideClickHandler
              onOutsideClick={() => setShowMessageMenu(false)}
            >
              <BsThreeDotsVertical
                onClick={() => setShowMessageMenu(!showMessageMenu)}
              />
              {showMessageMenu ? (
                <div className="text-slate-100 bg-text_dark_secondary p-2 text-sm rounded-md absolute top-0 -left-14">
                  <p
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      setShowMessageMenu(false);
                    }}
                    className=" mb-1 hover:text-slate-300"
                  >
                    copy
                  </p>
                  <p
                    onClick={() => deleteChatMessage(message._id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    Delete
                  </p>
                </div>
              ) : (
                ""
              )}
            </OutsideClickHandler>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatsSection() {
  const {
    messages,
    currentSelectedChat,
    loadingMessages,
    message,
    setMessage,
    sendChatMessage,
    attachments,
    setAttachments,
    removeFileFromAttachments,
    deleteUserChat,
    setIsChatSelected,
  } = useChat();
  const { user } = useAuth();

  const opponentParticipant = getOpponentParticipant(
    currentSelectedChat.current?.participants,
    user._id
  );

  const opponentUsername = opponentParticipant?.username;
  const opponentProfilePictureUrl = opponentParticipant?.avatarUrl;

  const scrollToBottomRef = new useRef();

  const scrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView();
  };

  const { handleCall, setTargetUserId } = useConnectWebRtc();

  const handleCallButtonClick = async () => {
    setTargetUserId(opponentParticipant?._id);
    handleCall();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="overflow-y-hidden">
      <div className="flex w-full items-center justify-between p-5 md:p-4 shadow-md md:shadow-xl ">
        <div className="flex gap-3 items-center ">
          <div onClick={() => setIsChatSelected(false)}>
            {" "}
            <MdArrowBackIos className="hidden md:block dark:text-white text-2xl" />{" "}
          </div>
          {currentSelectedChat.current.isGroupChat ? (
            <div className="w-10 relative h-10 flex-shrink-0 flex justify-start items-center flex-nowrap mr-3">
              {currentSelectedChat.current.participants
                .slice(0, 3)
                .map((participant, i) => {
                  return (
                    <img
                      key={participant._id}
                      src={participant.avatarUrl}
                      className={`w-10 h-10  border-white rounded-full absolute outline outline-3 outline-black ${
                        i === 0
                          ? "left-0 z-30"
                          : i === 1
                          ? "left-2 z-20"
                          : i === 2
                          ? "left-4 z-10"
                          : ""
                      }`}
                    />
                  );
                })}
            </div>
          ) : (
            <img
              className="size-10 rounded-full object-cover"
              src={opponentProfilePictureUrl}
              alt=""
              loading="lazy"
            />
          )}

          {/* <img
            className="size-12 rounded-full object-cover"
            src={opponentProfilePictureUrl}
            alt=""
          /> */}
          <h3 className="font-medium text-xl md:text-md text-slate-800 dark:text-white">
            {currentSelectedChat.current?.isGroupChat
              ? currentSelectedChat.current.name
              : opponentUsername}
          </h3>
        </div>

        <div className="text-xl flex gap-5 text-slate-800 dark:text-slate-100 ">
          <div className="cursor-pointer">
            <BiSearch />
          </div>
          {/* <div className="cursor-pointer">
            <IoCallOutline />
          </div>
        */}
          <div className="cursor-pointer">
            {!currentSelectedChat.current?.isGroupChat && (
              <IoVideocamOutline onClick={handleCallButtonClick} />
            )}
          </div>
          <div className="cursor-pointer text-red-500">
            {currentSelectedChat.current?.admin.toString() === user._id ? (
              <MdDeleteOutline
                onClick={() => deleteUserChat(currentSelectedChat.current?._id)}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      <div className="chat-msg-cont relative overflow-auto px-4 md:px-0 w-full h-[calc(100vh-180px)] md:h-[calc(100vh-260px)] ">
        {loadingMessages ? (
          <div className=" h-full w-full flex items-center justify-center">
            <Loading />
          </div>
        ) : !messages?.length ? (
          <div className="h-full w-full flex items-center justify-center">
            <h1 className="text-2xl text-slate-400 dark:text-slate-500">
              No Messages Yet...
            </h1>
          </div>
        ) : (
          <>
            {messages?.map((msg) => (
              <MessageCont
                key={msg._id}
                isOwnMessage={msg.sender?._id === user?._id}
                isGroupChatMessage={currentSelectedChat.current?.isGroupChat}
                message={msg}
              />
            ))}
            <div ref={scrollToBottomRef} />
          </>
        )}
      </div>
      {!!attachments.length && (
        <div className="showAttachmentFiles absolute bottom-24  grid grid-cols-5 gap-2 ">
          {attachments?.map((file, index) => (
            <div
              key={index}
              className="px-2 bg-slate-900 bg-opacity-50 rounded-md flex flex-col items-center"
            >
              <div className="text-red-500 w-full ">
                <RxCross2
                  className="float-right text-2xl cursor-pointer"
                  onClick={() => removeFileFromAttachments(index)}
                />
              </div>
              <img
                loading="lazy"
                src={URL.createObjectURL(file)}
                className="size-[200px] object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      )}
      <div className="h-[90px] md:h-[60px] border-t shadow-xl dark:border-slate-500 light-upper-cont-shadow dark:dark-upper-cont-shadow bg-slate w-full flex items-center justify-between p-4 md:p-2 ">
        <div className="flex-1 mr-4 md:mr-2 ">
          <input
            type="text"
            placeholder="Enter Message..."
            className="w-full h-full px-4 py-2 md:p-2 md:text-sm rounded-lg dark:bg-slate-600 border border-transparent bg-backgroundLight3 focus:outline-none dark:text-white text-black "
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChatMessage();
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 md:space-x-2">
          <div>
            <label htmlFor="imageAttach" className="cursor-pointer">
              <FiImage className="text-primary text-2xl md:text-md hover:text-primary_hover" />
            </label>
            <input
              type="file"
              accept="image/*"
              id="imageAttach"
              hidden
              value=""
              max={5}
              multiple
              onChange={(e) => setAttachments([...e.target.files])}
            />
          </div>
          {/* // future version 
          <div>
            <label htmlFor="fileAttach" className="cursor-pointer">
              <IoMdAttach className="text-primary text-xl hover:text-primary_hover" />
            </label>
            <input
              type="file"
              id="fileAttach"
              hidden
              value=""
              max={5}
              multiple
              onChange={(e) => setAttachments([...e.target.files])}
            />
          </div> */}

          <button
            disabled={!message && !attachments.length}
            onClick={sendChatMessage}
            className="bg-primary hover:bg-primary_hover transition-colors px-4 py-2 md:px-3 md:py-1 rounded-lg text-white"
          >
            <IoMdSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
