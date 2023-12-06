#!/usr/bin/env -S ./deno run -A
const encoder = new TextEncoder();
const decoder = new TextDecoderStream();

const listener = Deno.listen({ port: 8000 });
const { hostname, port, transport } = listener.addr as Deno.NetAddr;
console.log(
  `Listening on hostname: ${hostname}, port: ${port}, transport: ${transport}`,
);
try {
  const { readable, writable } = await listener.accept();
  const writer = writable.getWriter();

  await readable
    .pipeThrough(decoder)
    .pipeTo(
      new WritableStream({
        async write(value) {
          console.log("Just received", typeof value, value);
          await writer.write(encoder.encode(value));
        },
        close() {
          console.log("Stream closed");
        },
        abort(reason) {
          console.log(reason);
        },
      }),
    );
} catch (e) {
  console.log(e.message);
}
listener.unref();
