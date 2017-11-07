export default (messageId: number, name: string, voteCount: number, voted: boolean) => `
  <div class="reaction ${voted ? 'self-voted' : ''}">
    ${name} ${voteCount}
  </div>
`;
