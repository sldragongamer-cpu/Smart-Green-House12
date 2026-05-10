export default function Home() {
  return (
useEffect(() => {
  const grid = GridStack.init({ float: true });
  const tempChart = new Chart(
    document.getElementById("tempChart") as HTMLCanvasElement,
    {
      type: "line",
      data: { labels: [], datasets: [{ label: "Temperature", data: [] }] },
    }
  );
}, []);

