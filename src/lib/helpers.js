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

export const countComments = ({ list, opt }) => {
    return Object.entries(list).reduce((total, [id, comment]) => {
        if (comment[opt.key] === opt.value) {
            return total + 1;
        } else {
            return total;
        }
    }, 0);
};
