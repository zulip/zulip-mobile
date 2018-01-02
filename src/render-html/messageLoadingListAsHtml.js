import messageLoadingAsHtml from './messageLoadingAsHtml';

export default isFetching =>
  isFetching
    ? [
        messageLoadingAsHtml(),
        messageLoadingAsHtml(),
        messageLoadingAsHtml(),
        messageLoadingAsHtml(),
        messageLoadingAsHtml(),
        messageLoadingAsHtml(),
      ]
    : [];
