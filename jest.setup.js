// Import testing-library matchers
import '@testing-library/jest-dom'

// Mock Request object for Next.js
global.Request = class Request {
  constructor(input, init) {
    if (typeof input === 'string') {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    } else {
      this.url = input.url;
      this.method = input.method || 'GET';
      this.headers = new Headers(input.headers);
    }
  }
};

// Mock Response object for Next.js
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Headers(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = 'basic';
    this.url = '';
  }

  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
};
