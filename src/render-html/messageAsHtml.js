/* @flow */
import type { FlagsState, ReactionType, RealmEmojiType } from '../types';
import { shortTime } from '../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';
import base64 from 'base-64';
import RNFetchBlob from 'react-native-fetch-blob';

const messageDiv = (id: number, msgClass: string, flags: Object): string =>
  `<div
     class="message ${msgClass}"
     id="msg-${id}"
     data-msg-id="${id}"
     ${flags.map(flag => `data-${flag}="true" `).join('')}
    >`;

const messageSubheader = ({
  fromName,
  timestamp,
  twentyFourHourTime,
}: {
  fromName: string,
  timestamp: number,
  twentyFourHourTime: boolean,
}) => `
<div class="subheader">
  <div class="username">
    ${fromName}
  </div>
  <div class="timestamp">
    ${shortTime(new Date(timestamp * 1000), twentyFourHourTime)}
  </div>
</div>
`;

type BriefMessageProps = {
  content: string,
  flags: FlagsState,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: ReactionType[],
  realmEmoji: RealmEmojiType,
  timeEdited: Date,
};

type FullMessageProps = BriefMessageProps & {
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
  twentyFourHourTime: boolean,
};

type Props = FullMessageProps & {
  isBrief: boolean,
};

// An async function but do remember it return a promise...
async function getBase64(url, val) {
  const headers = {
    // "user-agent" : "ZulipMobile/1.0.13 (Android 6.0)",
    // "content-type" : "application/x-www-form-urlencoded; charset=utf-8",
    "Authorization": "Basic aGFyc2h1bHNoYXJtYTAwMEBnbWFpbC5jb206MjU0ZGNnaFl1Y3MyTG1vM0JJcHdYbDg5TzF1RlVGeEQ=",
  };
  // FAILED ATTEMPT with normal fetch api and base64 
  // NOTE- PLEASE CHECK API RESPONSE BEFORE PROCEEDING
  
  // const response = await fetch(url,{method:'GET', headers, mode: 'cors', cache: 'default'});
  // const res = await response.arrayBuffer();
  // const encoded = base64.encode(res);

  const fs = RNFetchBlob.fs;
  let imagePath = null;
  let resp = await RNFetchBlob
              .config({ 
                    fileCache : true 
              })
              .fetch('GET', url, headers  );
    // the image is now dowloaded to device's storage
    imagePath = resp.path();
  let base64Data = await resp.readFile('base64');
  console.logs(base64Data); // Check if base64 data is correct
  fs.unlink(imagePath)
  return base64Data;
  
  // Just an earlier attempt with .then()
  // .then((base64Data) => { 
    //     // here's base64 encoded image
    //     console.logs(base64Data)
    //     val = base64Data;
    //     // remove the file from storage
    //     return fs.unlink(imagePath)
    // });
};

const messageBody =  ({
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
}: {
  content: string,
  flags: Object,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: ReactionType[],
  realmEmoji: ReactionType,
  timeEdited: Date,
}) => {
  let val = null; 
  // Regex to scan out image URLs
  const regex = /<img src="(.*)">/g; 
  // A replacement string to convert relative to full URL manually and replace it within img tags
  const substr = `<img src="https://hsinter0.zulipchat.com/static$1" >`; 
  
  // A very cheap and disgusting replacement style but it works!
  // content = `${content}`.replace(regex,substr);
  
  // Get base64 for a given image(URL provided)
  // val = await getBase64('https://hsinter0.zulipchat.com/user_uploads/2592/QdFY8LLU32q-pOh9MV37nzoQ/art.jpg');
  
  // I also planned to return image tags with embeded base64 strings but these opertions are aync
  // And as we know our whole rendering process is synchronous
  
  // let funfunc =  async (val) => {
  //   let valuuuu = await getBase64('https://hsinter0.zulipchat.com/user_uploads/2592/QdFY8LLU32q-pOh9MV37nzoQ/art.jpg');
  //   return `<img src="data:image/jpeg;base64,${val}" >`;
  // };
  
  content = `${content}`.replace(regex, substr);
  // console.logs('bing bandlesk blaaahoooh');
  // console.logs(content); //Finally replaced the img tags 
  return `
${content}
${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
${messageTagsAsHtml(flags, timeEdited)}
${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji)}
`;};

const briefMessageAsHtml = ({
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
}: BriefMessageProps) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    ${messageBody({ content, flags, id, isOutbox, ownEmail, reactions, realmEmoji, timeEdited })}
  </div>
</div>
`;

const fullMessageAsHtml = ({
  id,
  content,
  flags,
  fromName,
  fromEmail,
  timestamp,
  avatarUrl,
  twentyFourHourTime,
  timeEdited,
  isOutbox,
  reactions,
  ownEmail,
  realmEmoji,
}: FullMessageProps) => `
${messageDiv(id, 'message-full', flags)}
  <div class="avatar">
    <img src="${avatarUrl}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    ${messageSubheader({ fromName, timestamp, twentyFourHourTime })}
    ${messageBody({ content, flags, id, isOutbox, ownEmail, reactions, realmEmoji, timeEdited })}
  </div>
</div>
`;

export default (props: Props) =>
  props.isBrief ? briefMessageAsHtml(props) : fullMessageAsHtml(props);
