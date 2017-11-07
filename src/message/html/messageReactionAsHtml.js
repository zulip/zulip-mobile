export default (messageId: number, name: string, voteCount: number, voted: boolean) => `
  <span class="reaction ${voted ? 'self-voted' : ''}">
    ${name} ${voteCount}
  </span>
`;
