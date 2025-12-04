import '@testing-library/jest-dom';

// TextEncoder/Decoder polyfills
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// Web Streams API polyfills
if (typeof ReadableStream === 'undefined') {
    const streams = require('node:stream/web');
    global.ReadableStream = streams.ReadableStream;
    global.TransformStream = streams.TransformStream;
    global.WritableStream = streams.WritableStream;
}

// Mock de bitacora (global)
jest.mock('@/lib/bitacora', () => ({
    __esModule: true,
    registrarCambio: jest.fn().mockResolvedValue(undefined),
    cambiosCreate: jest.fn((v) => ({ valor: v })),
    cambiosUpdate: jest.fn((v) => v),
    cambiosSoftDelete: jest.fn((v) => v),
}));

// Mock de next-intl con mapeo de claves a textos esperados por tests
jest.mock('next-intl', () => {
    const messages = {
        'loading': 'Cargando...',
        'common.loading': 'Cargando...',
        'fields.date': 'Fecha',
        'fields.place': 'Lugar',
        'fields.value': 'Valor',
        'fields.recordType': 'Tipo',
        'fields.notes': 'Notas',
        'common.users': 'Autor',
        'common.actions': 'Acciones',
        'common.total': 'Total',
        'common.page': 'Página',
        'common.previous': 'Anterior',
        'common.next': 'Siguiente',
        'cycles.title': 'Ciclo',
        'cycles.daysSinceSowing': 'Días desde siembra',
        'cycles.since': 'desde',
        'measurements.fields.date': 'Fecha',
        'measurements.fields.place': 'Lugar',
        'measurements.fields.value': 'Valor',
        'measurements.fields.recordType': 'Tipo',
        'measurements.fields.notes': 'Notas',
    };

    return {
        __esModule: true,
        useTranslations: (namespace) => (key) => {
            const fullKey = namespace ? `${namespace}.${key}` : key;
            return messages[fullKey] || messages[key] || key;
        },
        useFormatter: () => ({
            dateTime: (d) => d.toLocaleDateString(),
            number: (n) => n.toString(),
        }),
        NextIntlClientProvider: ({ children }) => children,
    };
});

jest.mock('use-intl', () => ({
    __esModule: true,
    useTranslations: (namespace) => (key) => key,
    useLocale: () => 'es',
}));

// Fetch API polyfills for Next.js tests (especially when using jsdom)
if (typeof Request === 'undefined') {
    const { Request, Response, Headers, fetch } = require('next/dist/compiled/@edge-runtime/primitives/fetch');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
    global.fetch = fetch;
}
