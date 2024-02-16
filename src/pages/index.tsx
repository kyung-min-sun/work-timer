import { useEffect, useState } from "react";

import Head from "next/head";

type TimeLog = {
  startTime: Date;
  endTime: Date;
};

export default function Home() {
  const [timerStartTime, setTimerStartTime] = useState<Date>();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [logs, setLogs] = useState<TimeLog[]>();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 100);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (logs == undefined) {
      try {
        const items = localStorage.getItem("logs");
        if (!items) setLogs([]);
        else {
          const newLogs = JSON.parse(items) as TimeLog[];
          setLogs(newLogs ?? []);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        localStorage.setItem("logs", JSON.stringify(logs));
      } catch (e) {
        console.log(e);
      }
    }
  }, [logs]);

  const formatMiliseconds = (miliseconds: number) => {
    const hours = Math.floor(miliseconds / (60 * 60 * 1000));
    const minutes =
      Math.floor((miliseconds % (60 * 60 * 1000)) / (60 * 1000)) % 60;
    const seconds = Math.floor((miliseconds % (60 * 60 * 1000)) / 1000) % 60;

    const padDigits = (number: number) =>
      number < 10 ? `0${number}` : number.toString();

    return `${padDigits(hours)}:${padDigits(minutes)}:${padDigits(seconds)}`;
  };

  const formatTime = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    return formatMiliseconds(diff);
  };

  const formatLogsToCsv = (logs: TimeLog[]) => {
    const csvContent = "data:text/csv;charset=utf-8,";
    return csvContent.concat(
      logs
        .map(
          ({ startTime, endTime }) =>
            `${startTime.toString()},${endTime.toString()}`,
        )
        .join("\n"),
    );
  };

  const parseLogsFromCsv = async (csvFile: File): Promise<[Date, Date][]> => {
    const csvText = await csvFile.text();
    const logs = csvText.split("\n").map((row) => row.split(","));
    return logs.flatMap((log) =>
      log[0] && log[1] ? [[new Date(log[0]), new Date(log[1])]] : [],
    );
  };

  // in case we don't deserialize the date properly from local storage
  const safeLogs =
    logs?.map((log) => ({
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime),
    })) ?? [];

  const today = new Date();
  const timeWorkedToday = safeLogs
    .filter(
      (log) =>
        log.startTime.getFullYear() == today.getFullYear() &&
        log.startTime.getMonth() == today.getMonth() &&
        log.startTime.getDate() == today.getDate(),
    )
    .reduce(
      (total, log) => total + (log.endTime.getTime() - log.startTime.getTime()),
      0,
    );

  return (
    <>
      <Head>
        <title>Work Timer</title>
        <meta
          name="description"
          content="this is a work timer to measure how much i work"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col gap-8 p-4">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold">Timer</h2>
          {!timerStartTime && (
            <button
              className="border border-black p-2 font-medium"
              onClick={() => setTimerStartTime(new Date())}
            >
              Start
            </button>
          )}
          {timerStartTime && (
            <>
              {currentTime > timerStartTime && (
                <div className="font-medium">
                  {formatTime(timerStartTime, currentTime)}
                </div>
              )}
              <button
                className="border border-black p-2 font-medium"
                onClick={() => {
                  setLogs(
                    (logs ?? []).concat({
                      startTime: timerStartTime,
                      endTime: new Date(),
                    }),
                  );
                  setTimerStartTime(undefined);
                }}
              >
                Stop
              </button>
            </>
          )}
        </div>
        <div>
          <h2 className="font-bold">Total Time Worked Today</h2>
          <p>Total: {formatMiliseconds(timeWorkedToday)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Past Logs</h2>
          <div className="flex flex-row items-center gap-2">
            <button
              className="w-fit border border-black p-1 text-xs"
              onClick={() => {
                const text = formatLogsToCsv(logs ?? []);
                const encodedUri = encodeURI(text);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "my_data.csv");
                link.click();
              }}
            >
              Download CSV
            </button>
            <button
              className="w-fit border border-black p-1 text-xs"
              onClick={() => {
                setLogs([]);
              }}
            >
              Clear
            </button>
          </div>
          <input
            type="file"
            onInput={async (e) => {
              const files = e.currentTarget.files;
              if (!files) return;
              for (const file of files) {
                const uploadedLogs = await parseLogsFromCsv(file);
                setLogs((logs) =>
                  logs?.concat(
                    uploadedLogs.map(([startTime, endTime]) => ({
                      startTime,
                      endTime,
                    })),
                  ),
                );
              }
            }}
          />
          <ul className="flex flex-col gap-2">
            {!logs && <li>None</li>}
            {logs
              ?.sort(
                (l1, l2) =>
                  new Date(l2.startTime).getTime() -
                  new Date(l1.startTime).getTime(),
              )
              .map((log, i) => (
                <li key={i}>
                  <p>
                    Total:{" "}
                    {formatTime(new Date(log.startTime), new Date(log.endTime))}
                  </p>
                  <p>End: {new Date(log.endTime).toLocaleString("en-US")}</p>
                  <p>
                    Start: {new Date(log.startTime).toLocaleString("en-US")}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </>
  );
}
