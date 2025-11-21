import '@testing-library/jest-dom';

// TextEncoder/Decoder are usually present in Node, but just in case for some older versions
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
