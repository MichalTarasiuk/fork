import { isPrimitive, cloneObject } from 'src/utils';
export const buildOf = (value, source) => Object.keys(value).reduce((accumulator, key) => {
    const nestedSource = source[key];
    const nestedAcc = accumulator[key];
    if (key in source && nestedSource) {
        ;
        accumulator[key] = isPrimitive(nestedAcc)
            ? nestedSource
            : buildOf(nestedAcc, nestedSource);
    }
    return accumulator;
}, cloneObject(value));
