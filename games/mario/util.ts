export const randNum = (props: {
   min: number;
   max: number;
   decimal?: boolean;
}): number => {
   const { min, max, decimal = false } = props;
   const baseRand = Math.random() * (max - min + 1) + min;
   return decimal ? baseRand : Math.floor(baseRand);
};
