export const convertObjFromArray = (array) => {
    const objList = array.reduce(
        (acc, item) => ({
            ...acc,
            [item.id]: {
                ...item,
            },
        }),
        {},
    );
    return objList;
};

export const convertArrayFromObj = (obj) => {
    const array = Object.entries(obj).map(([id, item]) => item);
    return array;
};
