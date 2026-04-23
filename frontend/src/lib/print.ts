import { toast } from "sonner";

export const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const openPrintWindow = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    toast.error("Couldn't open the print view", { id: "nest-print" });
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 200);
  };
  win.onafterprint = cleanup;
  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      toast.error("Couldn't open the print view", { id: "nest-print" });
      iframe.remove();
      return;
    }
    window.setTimeout(cleanup, 2000);
  };
  if (doc.readyState === "complete") {
    runPrint();
  } else {
    iframe.onload = runPrint;
  }
};
