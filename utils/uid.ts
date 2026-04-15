const uid = (): string => Math.random().toString(36).slice(2, 10);

export default uid;
