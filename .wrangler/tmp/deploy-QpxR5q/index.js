var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import { DurableObject } from "cloudflare:workers";
var MyDurableObject = class extends DurableObject {
  static {
    __name(this, "MyDurableObject");
  }
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   */
  constructor(ctx, env) {
    super(ctx, env);
  }
  /**
   * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
   *  Object instance receives a request from a Worker via the same method invocation on the stub
   *
   * @param name - The name provided to a Durable Object instance from a Worker
   * @returns The greeting to be sent back to the Worker
   */
  async sayHello(name) {
    return `Hello, ${name}!`;
  }
};
var index_default = {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request, env, ctx) {
    const stub = env.MY_DURABLE_OBJECT.getByName("foo");
    const greeting = await stub.sayHello("world");
    return new Response(greeting);
  }
};
export {
  MyDurableObject,
  index_default as default
};
//# sourceMappingURL=index.js.map
