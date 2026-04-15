const money = (v: number): string => `£${Number(v || 0).toFixed(2)}`;

export default money;
