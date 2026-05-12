import { addSSEClient, removeSSEClient, getLatestSensor } from "@/app/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data immediately
      const initial = getLatestSensor();
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initial)}\n\n`));

      const id = addSSEClient(controller);

      // Keep-alive ping every 30s
      const pingIv = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          clearInterval(pingIv);
          removeSSEClient(id);
        }
      }, 30000);

      // Cleanup on close
      (controller as any)._cleanup = () => {
        clearInterval(pingIv);
        removeSSEClient(id);
      };
    },
    cancel(controller) {
      if ((controller as any)._cleanup) (controller as any)._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
