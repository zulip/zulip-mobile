export const OPEN_STREAM_SIDEBAR = 'OPEN_STREAM_SIDEBAR';
export const CLOSE_STREAM_SIDEBAR = 'CLOSE_STREAM_SIDEBAR';

export const openStreamSidebar = () => {
    return { type: OPEN_STREAM_SIDEBAR }
};

export const closeStreamSidebar = () => {
    return { type: CLOSE_STREAM_SIDEBAR };
};
