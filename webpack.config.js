export const resolve = {
    fallback: {
        util: require.resolve('util'),
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
    },
};
