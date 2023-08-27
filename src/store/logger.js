export default function logger(reducer) {
    return (prevState, action) => {
        console.group(action.type);

        console.log('Prev state: ');
        console.log(prevState);

        console.log('Action: ');
        console.log(action);

        const nextState = reducer(prevState, action);

        console.log('Next state: ');
        console.log(nextState);

        console.groupEnd();

        return nextState;
    };
}
